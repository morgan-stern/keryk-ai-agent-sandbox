'use client'

import { useState, useEffect } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Volume2, AlertCircle } from 'lucide-react'
import { useOpenAIRealtime } from '@/hooks/useOpenAIRealtime'

interface VoiceModeProps {
  agentId: string
  agentName: string
  onSwitchToText: () => void
}

export function VoiceMode({ agentId, agentName, onSwitchToText }: VoiceModeProps) {
  const [apiKey, setApiKey] = useState<string>('')

  // Get API key from environment
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (key) {
      setApiKey(key)
    }
  }, [])

  const {
    isConnected,
    isRecording,
    isPlaying,
    error,
    transcript,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  } = useOpenAIRealtime({
    apiKey,
    instructions: `You are ${agentName}, a helpful AI assistant. Respond naturally and conversationally in voice conversations.`
  })

  const handleConnect = () => {
    if (!apiKey) {
      return
    }
    connect()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  if (!apiKey) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
            <AlertCircle className="w-4 h-4" />
            <span>OpenAI API key not configured</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Configuration Required</h2>
                <p className="text-text-muted mb-6">
                  Voice mode requires an OpenAI API key to be configured.
                </p>
              </div>
              <button
                onClick={onSwitchToText}
                className="w-full px-6 py-2 border border-border rounded-lg hover:bg-card-hover transition-colors"
              >
                Switch to Text Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {transcript && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>You said:</strong> {transcript}
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="space-y-6">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-colors ${
              isConnected ? 'bg-green-100 dark:bg-green-950/30' : 'bg-primary/10'
            }`}>
              {isConnected ? (
                <Phone className={`w-16 h-16 ${isRecording ? 'text-red-500 animate-pulse' : 'text-green-600'}`} />
              ) : (
                <PhoneOff className="w-16 h-16 text-primary" />
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-2">Voice-to-Voice Chat</h2>
              <p className="text-text-muted mb-6">
                {isConnected 
                  ? `Connected to ${agentName}. ${isRecording ? 'Listening...' : isPlaying ? 'Playing response...' : 'Click microphone to talk'}`
                  : `Real-time voice conversations with ${agentName} using OpenAI Realtime API`
                }
              </p>
              
              {/* HTTPS requirement notice */}
              {!isConnected && typeof window !== 'undefined' && window.location.protocol === 'http:' && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 mb-4 text-sm">
                  <p className="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Voice chat requires HTTPS on mobile devices
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-400 mt-2">
                    Access this site using: <strong>https://{window.location.host}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Connect Voice Chat
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleRecording}
                      disabled={isPlaying}
                      className={`flex-1 px-6 py-3 rounded-lg transition-colors font-medium ${
                        isRecording 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5 inline mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5 inline mr-2" />
                          Start Recording
                        </>
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={handleDisconnect}
                    className="w-full px-6 py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
              
              <button
                onClick={onSwitchToText}
                className="w-full px-6 py-2 border border-border rounded-lg hover:bg-card-hover transition-colors"
              >
                Switch to Text Mode
              </button>
            </div>

            {isPlaying && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm">Playing AI response...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
