'use client'

import { useEffect, useState } from 'react'
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice'
import { VoiceChat } from './VoiceChat'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface VoiceChatInterfaceProps {
  agentId: string
  agentName: string
  apiKey?: string
  className?: string
  onMessage?: (message: string, role: 'user' | 'assistant') => void
  onError?: (error: Error) => void
}

export function VoiceChatInterface({
  agentId,
  agentName,
  apiKey,
  className,
  onMessage,
  onError
}: VoiceChatInterfaceProps) {
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([])
  
  const {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    lastAgentMessage,
    audioLevel,
    connect,
    disconnect,
    toggleMute,
  } = useRealtimeVoice({
    apiKey,
    agentId,
    onMessage: (message, role) => {
      setMessages(prev => [...prev, { role, content: message }])
      onMessage?.(message, role)
    },
    onError: (err) => {
      setError(err.message)
      onError?.(err)
    },
    onAudioLevel: (level) => {
      // Audio level is provided to VoiceChat for visualization
    }
  })

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleConnectionChange = (connected: boolean) => {
    if (connected) {
      connect()
    } else {
      disconnect()
    }
  }

  const handleMuteChange = (muted: boolean) => {
    toggleMute()
  }

  // Get the last message from each role for display
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || transcript
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()?.content || lastAgentMessage

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Welcome message */}
      {!isConnected && (
        <div className="text-center p-8">
          <h2 className="text-xl font-heading mb-2">Voice Chat with {agentName}</h2>
          <p className="text-text-muted text-sm mb-4">
            Click the phone icon below to start a voice conversation
          </p>
          <p className="text-xs text-text-muted">
            Make sure your microphone is enabled and you have a stable internet connection
          </p>
        </div>
      )}

      {/* Voice chat interface */}
      <VoiceChat
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={lastUserMessage}
        lastAgentMessage={lastAssistantMessage}
        audioLevel={audioLevel}
        onConnectionChange={handleConnectionChange}
        onMuteChange={handleMuteChange}
        className="flex-1"
      />

      {/* Connection status */}
      {isConnected && (
        <div className="text-center p-2 text-xs text-text-muted border-t border-border">
          {isSpeaking ? 'Agent is speaking...' : isListening ? 'Listening...' : 'Connected'}
        </div>
      )}
    </div>
  )
}