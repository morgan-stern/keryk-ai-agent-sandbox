'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface RealtimeVoiceOptions {
  apiKey?: string
  agentId: string
  onMessage?: (message: string, role: 'user' | 'assistant') => void
  onTranscript?: (transcript: string, isFinal: boolean) => void
  onError?: (error: Error) => void
  onAudioLevel?: (level: number) => void
}

interface RealtimeConfig {
  model: string
  voice?: string
  instructions?: string
  temperature?: number
  max_tokens?: number
  modalities?: string[]
  turn_detection?: {
    type: 'server_vad' | 'none'
    threshold?: number
    prefix_padding_ms?: number
    silence_duration_ms?: number
  }
}

export function useRealtimeVoice({
  apiKey,
  agentId,
  onMessage,
  onTranscript,
  onError,
  onAudioLevel,
}: RealtimeVoiceOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastAgentMessage, setLastAgentMessage] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize audio context and analyzer
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      mediaStreamRef.current = stream
      
      // Monitor audio levels
      const monitorAudioLevel = () => {
        if (!analyserRef.current || !isListening) return
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1
        
        setAudioLevel(normalizedLevel)
        onAudioLevel?.(normalizedLevel)
        
        requestAnimationFrame(monitorAudioLevel)
      }
      
      monitorAudioLevel()
      
      return true
    } catch (error) {
      onError?.(new Error('Microphone access denied'))
      return false
    }
  }, [isListening, onAudioLevel, onError])
  
  // Connect to OpenAI Realtime API
  const connect = useCallback(async () => {
    try {
      const audioInitialized = await initializeAudio()
      if (!audioInitialized) return
      
      // Check if API key exists
      if (!apiKey) {
        throw new Error('OpenAI API key is required for voice chat')
      }
      
      // Create WebSocket connection
      // Note: Browser WebSocket doesn't support custom headers, 
      // so we'll send the auth in the first message
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`
      )
      
      ws.onopen = () => {
        console.log('Connected to OpenAI Realtime API')
        setIsConnected(true)
        
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are a helpful AI assistant named ${agentId}. Respond naturally and conversationally.`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            },
            tools: [],
            tool_choice: 'auto',
            temperature: 0.8,
            max_response_output_tokens: 4096
          }
        }))
        
        setIsListening(true)
      }
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'conversation.item.created':
            if (data.item.role === 'assistant' && data.item.content) {
              const content = data.item.content[0]
              if (content.type === 'text') {
                setLastAgentMessage(content.text)
                onMessage?.(content.text, 'assistant')
              }
            }
            break
            
          case 'audio.start':
            setIsSpeaking(true)
            break
            
          case 'audio.done':
            setIsSpeaking(false)
            break
            
          case 'input_audio_transcription.completed':
            setTranscript(data.transcript)
            onTranscript?.(data.transcript, true)
            onMessage?.(data.transcript, 'user')
            break
            
          case 'input_audio_transcription.partial':
            setTranscript(data.transcript)
            onTranscript?.(data.transcript, false)
            break
            
          case 'error':
            console.error('Realtime API error:', data.error)
            onError?.(new Error(data.error.message || 'Unknown error'))
            break
            
          case 'session.created':
            console.log('Session created:', data.session)
            break
            
          default:
            console.log('Unhandled message type:', data.type)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError?.(new Error('Connection error'))
        setIsConnected(false)
      }
      
      ws.onclose = () => {
        console.log('Disconnected from OpenAI Realtime API')
        setIsConnected(false)
        setIsListening(false)
        setIsSpeaking(false)
        
        // Attempt to reconnect after 3 seconds
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null
            if (wsRef.current === ws) {
              connect()
            }
          }, 3000)
        }
      }
      
      wsRef.current = ws
      
      // Start sending audio data
      if (mediaStreamRef.current && audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current)
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && isListening && !isSpeaking) {
            const inputData = e.inputBuffer.getChannelData(0)
            
            // Convert float32 to int16
            const int16Data = new Int16Array(inputData.length)
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]))
              int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
            }
            
            // Send audio data
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)))
            }))
          }
        }
        
        source.connect(processor)
        processor.connect(audioContextRef.current.destination)
        audioProcessorRef.current = processor
      }
      
    } catch (error) {
      console.error('Connection error:', error)
      onError?.(error as Error)
      setIsConnected(false)
    }
  }, [agentId, apiKey, isListening, isSpeaking, onError, onMessage, onTranscript, initializeAudio])
  
  // Disconnect from the API
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    
    if (audioProcessorRef.current) {
      audioProcessorRef.current.disconnect()
      audioProcessorRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    setIsConnected(false)
    setIsListening(false)
    setIsSpeaking(false)
    setTranscript('')
    setLastAgentMessage('')
    setAudioLevel(0)
  }, [])
  
  // Toggle mute
  const toggleMute = useCallback(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = isListening
      })
      setIsListening(!isListening)
    }
  }, [isListening])
  
  // Send a text message
  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{
            type: 'text',
            text
          }]
        }
      }))
    }
  }, [])
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])
  
  return {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    lastAgentMessage,
    audioLevel,
    connect,
    disconnect,
    toggleMute,
    sendMessage,
  }
}