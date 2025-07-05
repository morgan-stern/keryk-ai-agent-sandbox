import { useState, useEffect, useRef, useCallback } from 'react';

interface RealtimeConfig {
  apiKey: string;
  model?: string;
  voice?: string;
  instructions?: string;
}

interface RealtimeState {
  isConnected: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  error: string | null;
  transcript: string;
}

export function useOpenAIRealtime(config: RealtimeConfig) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isRecording: false,
    isPlaying: false,
    error: null,
    transcript: '',
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Generate ephemeral API key for WebRTC connection
  const generateEphemeralKey = useCallback(async () => {
    try {
      const response = await fetch('/api/generate-ephemeral-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: config.apiKey })
      });

      if (!response.ok) {
        throw new Error('Failed to generate ephemeral key');
      }

      const data = await response.json();
      return data.ephemeralKey;
    } catch (error) {
      console.error('Ephemeral key generation error:', error);
      setState(prev => ({ ...prev, error: 'Failed to generate session key' }));
      return null;
    }
  }, [config.apiKey]);

  // Handle realtime messages from the data channel
  const handleRealtimeMessage = useCallback((message: any) => {
    console.log('Received message:', message.type);
    switch (message.type) {
      case 'input_audio_buffer.speech_started':
        console.log('Speech started detected by server');
        setState(prev => ({ ...prev, isRecording: true }));
        break;
        
      case 'input_audio_buffer.speech_stopped':
        console.log('Speech stopped detected by server');
        setState(prev => ({ ...prev, isRecording: false }));
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        console.log('Transcription completed:', message.transcript);
        setState(prev => ({ ...prev, transcript: message.transcript }));
        break;
        
      case 'response.audio_transcript.delta':
        // Handle audio transcription updates
        console.log('Audio transcript delta:', message.delta);
        break;
        
      case 'response.audio_transcript.done':
        console.log('Audio transcript complete');
        break;
        
      case 'error':
        console.error('OpenAI error:', message.error);
        setState(prev => ({ ...prev, error: message.error?.message || 'Unknown error' }));
        break;
        
      case 'session.created':
        console.log('Session created successfully');
        break;
        
      case 'session.updated':
        console.log('Session updated successfully');
        break;
        
      default:
        console.log('Unhandled message type:', message.type);
    }
  }, []);

  // Create WebRTC connection following the mentor example pattern
  const createRealtimeConnection = useCallback(async (ephemeralKey: string, codec: string = 'pcm') => {
    try {
      const pc = new RTCPeerConnection();

      // Create audio element for playback if it doesn't exist
      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement('audio');
        audioElementRef.current.autoplay = true;
      }

      // Handle incoming audio stream
      pc.ontrack = (e) => {
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = e.streams[0];
          setState(prev => ({ ...prev, isPlaying: true }));
        }
      };

      // Get user media and add track
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      pc.addTrack(mediaStream.getTracks()[0]);

      // Set codec preferences based on selected codec
      const capabilities = RTCRtpSender.getCapabilities("audio");
      if (capabilities) {
        const chosenCodec = capabilities.codecs.find(
          (c) => c.mimeType.toLowerCase() === `audio/${codec}`
        );
        if (chosenCodec) {
          pc.getTransceivers()[0].setCodecPreferences([chosenCodec]);
        } else {
          console.warn(`Codec "${codec}" not found in capabilities. Using default settings.`);
        }
      }

      // Create data channel for events
      const dc = pc.createDataChannel("oai-events");

      // Handle data channel messages
      dc.onopen = () => {
        console.log('Data channel opened');
        
        // Send session configuration via data channel
        dc.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: config.instructions || 'You are a helpful AI assistant. Respond naturally and conversationally.',
            voice: config.voice || 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            }
          }
        }));
      };

      dc.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };

      // Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send SDP to OpenAI API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = config.model || "gpt-4o-realtime-preview-2024-12-17";

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSdp,
      };

      await pc.setRemoteDescription(answer);

      return { pc, dc };
    } catch (error) {
      console.error('WebRTC connection error:', error);
      setState(prev => ({ ...prev, error: `Connection failed: ${error.message}` }));
      return null;
    }
  }, [config, handleRealtimeMessage]);

  const connect = useCallback(async () => {
    if (pcRef.current?.connectionState === 'connected') {
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Generate ephemeral key for secure connection
      const ephemeralKey = await generateEphemeralKey();
      if (!ephemeralKey) {
        return;
      }

      // Create WebRTC connection
      const connection = await createRealtimeConnection(ephemeralKey);
      if (!connection) {
        return;
      }

      const { pc, dc } = connection;
      pcRef.current = pc;
      dcRef.current = dc;

      // Set connection state handlers
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        setState(prev => ({ 
          ...prev, 
          isConnected: pc.connectionState === 'connected' 
        }));
      };

      pc.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
          setState(prev => ({ ...prev, error: 'Connection lost', isConnected: false }));
        }
      };

    } catch (error) {
      console.error('Connection error:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect to voice service' }));
    }
  }, [generateEphemeralKey, createRealtimeConnection]);

  const startRecording = useCallback(() => {
    console.log('startRecording called - WebRTC handles continuous audio streaming');
    // With WebRTC, audio is automatically streamed and server VAD handles detection
    // This function is kept for compatibility with the VoiceMode component
  }, []);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called - sending response request via data channel');
    // Request response from assistant via data channel
    if (dcRef.current?.readyState === 'open') {
      console.log('Requesting response...');
      dcRef.current.send(JSON.stringify({
        type: 'response.create',
        response: {
          modalities: ['audio', 'text']
        }
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }
    
    setState({
      isConnected: false,
      isRecording: false,
      isPlaying: false,
      error: null,
      transcript: '',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  };
}