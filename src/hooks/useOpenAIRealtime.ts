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

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const initializeAudio = useCallback(async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Get microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Microphone access denied' }));
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Initialize audio first
      const audioInitialized = await initializeAudio();
      if (!audioInitialized) {
        return;
      }

      // Connect to OpenAI Realtime API
      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', [
        'realtime',
        `openai-insecure-api-key.${config.apiKey}`,
        'openai-beta.realtime-v1'
      ]);

      ws.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        
        // Send session configuration
        ws.send(JSON.stringify({
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

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (error) {
          // Silent error handling
        }
      };

      ws.onerror = (error) => {
        setState(prev => ({ ...prev, error: 'Connection failed', isConnected: false }));
      };

      ws.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
      };

      wsRef.current = ws;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to connect to voice service' }));
    }
  }, [config, initializeAudio]);

  const handleRealtimeMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'input_audio_buffer.speech_started':
        setState(prev => ({ ...prev, isRecording: true }));
        break;
        
      case 'input_audio_buffer.speech_stopped':
        setState(prev => ({ ...prev, isRecording: false }));
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        setState(prev => ({ ...prev, transcript: message.transcript }));
        break;
        
      case 'response.audio.delta':
        // Play audio chunk
        if (message.delta && audioContextRef.current) {
          playAudioChunk(message.delta);
        }
        break;
        
      case 'response.audio.done':
        setState(prev => ({ ...prev, isPlaying: false }));
        break;
        
      case 'error':
        setState(prev => ({ ...prev, error: message.error?.message || 'Unknown error' }));
        break;
    }
  }, []);

  const playAudioChunk = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    try {
      setState(prev => ({ ...prev, isPlaying: true }));
      
      // Decode base64 audio
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      // Create audio buffer and play
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (error) {
      // Silent error handling
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !wsRef.current) {
      setState(prev => ({ ...prev, error: 'Voice service not ready' }));
      return;
    }

    try {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert audio blob to base64 and send to OpenAI
          const reader = new FileReader();
          reader.onload = () => {
            const base64Audio = btoa(reader.result as string);
            wsRef.current?.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));
          };
          reader.readAsBinaryString(event.data);
        }
      };
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to start recording' }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Commit the audio buffer
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.commit'
        }));
        
        // Create response
        wsRef.current.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text']
          }
        }));
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
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