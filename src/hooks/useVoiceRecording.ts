'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceRecordingProps {
  onTranscript?: (transcript: string) => void
  onError?: (error: Error) => void
  useWhisper?: boolean // If true, use OpenAI Whisper API instead of Web Speech API
}

export function useVoiceRecording({
  onTranscript,
  onError,
  useWhisper = false
}: UseVoiceRecordingProps = {}) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  
  // Initialize Web Speech API
  useEffect(() => {
    if (!useWhisper && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        
        recognition.onresult = (event: any) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' '
            } else {
              interimTranscript += result[0].transcript
            }
          }
          
          const fullTranscript = finalTranscript || interimTranscript
          setTranscript(fullTranscript)
          
          if (finalTranscript) {
            onTranscript?.(finalTranscript.trim())
          }
        }
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          onError?.(new Error(`Speech recognition error: ${event.error}`))
          setIsRecording(false)
        }
        
        recognition.onend = () => {
          setIsRecording(false)
        }
        
        recognitionRef.current = recognition
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [useWhisper, onTranscript, onError])
  
  const startRecording = useCallback(async () => {
    try {
      setTranscript('')
      
      if (!useWhisper && recognitionRef.current) {
        // Use Web Speech API
        recognitionRef.current.start()
        setIsRecording(true)
        return
      }
      
      // Use MediaRecorder for Whisper API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })
      
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await processAudioWithWhisper(audioBlob)
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      onError?.(error as Error)
    }
  }, [useWhisper, onError])
  
  const stopRecording = useCallback(() => {
    if (!useWhisper && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [useWhisper])
  
  const processAudioWithWhisper = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio')
      }
      
      const data = await response.json()
      
      if (data.transcript) {
        setTranscript(data.transcript)
        onTranscript?.(data.transcript)
      }
    } catch (error) {
      console.error('Error processing audio:', error)
      onError?.(error as Error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])
  
  return {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
    toggleRecording,
    isSupported: !useWhisper ? !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition : true
  }
}