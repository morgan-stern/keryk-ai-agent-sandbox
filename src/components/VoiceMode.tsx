'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, AlertCircle, Sparkles } from 'lucide-react'
import { useOpenAIRealtime } from '@/hooks/useOpenAIRealtime'
import { cn } from '@/lib/utils'
import { AudioVisualizer } from './voice/AudioVisualizer'
import { ConnectionStatus, ConnectionState } from './voice/ConnectionStatus'
import { TranscriptView, TranscriptEntry } from './voice/TranscriptView'
import { VoiceControls } from './voice/VoiceControls'
import { MobileVoiceLayout } from './voice/MobileVoiceLayout'
import { VoiceSelector } from './voice/VoiceSelector'

interface VoiceModeProps {
  agentId: string
  agentName: string
  agentAvatar?: string
  onSwitchToText: () => void
}

export function VoiceMode({ agentId, agentName, agentAvatar, onSwitchToText }: VoiceModeProps) {
  const [apiKey, setApiKey] = useState<string>('')
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [voiceMode, setVoiceMode] = useState<'auto-detect' | 'push-to-talk'>('auto-detect')
  const [selectedVoice, setSelectedVoice] = useState<string>('alloy')
  const [inputAudioLevel, setInputAudioLevel] = useState(0)
  const [outputAudioLevel, setOutputAudioLevel] = useState(0)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const transcriptIdCounter = useRef(0)

  // Get API key from environment and load saved voice preference
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (key) {
      setApiKey(key)
    }
    
    // Load saved voice preference
    const savedVoice = localStorage.getItem('preferredVoice')
    if (savedVoice) {
      setSelectedVoice(savedVoice)
    }
  }, [])
  
  // Save voice preference when it changes
  useEffect(() => {
    localStorage.setItem('preferredVoice', selectedVoice)
  }, [selectedVoice])

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
    voice: selectedVoice,
    instructions: `You are ${agentName}, a helpful AI assistant. Respond naturally and conversationally in voice conversations.`
  })

  // Update connection state based on hook state
  useEffect(() => {
    if (error) {
      setConnectionState('error')
    } else if (isConnected) {
      setConnectionState('connected')
    }
  }, [isConnected, error])

  // Add new transcript entries when we get transcripts
  useEffect(() => {
    if (transcript && transcript !== currentTranscript) {
      setCurrentTranscript(transcript)
      const newEntry: TranscriptEntry = {
        id: `transcript-${transcriptIdCounter.current++}`,
        role: 'user',
        content: transcript,
        timestamp: new Date(),
        isInterim: false
      }
      setTranscriptEntries(prev => [...prev, newEntry])
    }
  }, [transcript, currentTranscript])

  // Simulate audio levels (in real implementation, this would come from audio analysis)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording && !isMuted) {
        setInputAudioLevel(0.3 + Math.random() * 0.7)
      } else {
        setInputAudioLevel(0)
      }

      if (isPlaying) {
        setOutputAudioLevel(0.4 + Math.random() * 0.6)
      } else {
        setOutputAudioLevel(0)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isRecording, isPlaying, isMuted])

  const handleConnect = async () => {
    if (!apiKey) {
      return
    }
    
    setConnectionState('initializing')
    
    // Simulate connection steps
    setTimeout(() => setConnectionState('requesting-permission'), 500)
    setTimeout(() => setConnectionState('connecting'), 1500)
    
    await connect()
  }

  const handleDisconnect = () => {
    disconnect()
    setConnectionState('idle')
    setTranscriptEntries([])
    setCurrentTranscript('')
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    // In real implementation, would mute/unmute the audio stream
  }

  const handleModeChange = (mode: 'auto-detect' | 'push-to-talk') => {
    setVoiceMode(mode)
  }

  const handlePushToTalk = (active: boolean) => {
    if (active && !isRecording) {
      startRecording()
    } else if (!active && isRecording) {
      stopRecording()
    }
  }

  if (!apiKey) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="space-y-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center animate-pulse">
                <AlertCircle className="w-16 h-16 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">Configuration Required</h2>
                <p className="text-text-muted mb-6">
                  Voice mode requires an OpenAI API key to be configured.
                </p>
                <p className="text-sm text-text-muted/60">
                  Set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file
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
    <div className="flex-1 flex flex-col bg-background">
      {/* Connection Banner */}
      {connectionState !== 'idle' && connectionState !== 'connected' && (
        <div className="bg-card border-b border-border p-4">
          <ConnectionStatus state={connectionState} error={error} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1 flex-row">
          {/* Left Panel - Voice Controls and Visualizers */}
          <div className="w-1/3 border-r border-border bg-card p-6 flex flex-col">
            <div className="flex-1 flex flex-col justify-center space-y-8">
            {/* Agent Info */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {agentAvatar ? (
                  <img 
                    src={agentAvatar} 
                    alt={agentName}
                    className="w-full h-full rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                )}
                {isConnected && (
                  <div className={cn(
                    "absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-card",
                    isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  )} />
                )}
              </div>
              <h2 className="text-xl font-semibold">{agentName}</h2>
              <p className="text-sm text-text-muted mt-1">
                {isConnected ? `Voice chat active (${selectedVoice})` : 'Ready to connect'}
              </p>
            </div>

            {/* Voice Selector */}
            {!isConnected && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted text-center">Select Voice</p>
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onVoiceChange={setSelectedVoice}
                  disabled={connectionState !== 'idle'}
                />
              </div>
            )}

            {/* Audio Visualizers */}
            {isConnected && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-text-muted mb-2 text-center">Your Voice</p>
                  <AudioVisualizer 
                    isActive={isRecording && !isMuted} 
                    audioLevel={inputAudioLevel}
                    type="input"
                  />
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-2 text-center">{agentName}'s Voice</p>
                  <AudioVisualizer 
                    isActive={isPlaying} 
                    audioLevel={outputAudioLevel}
                    type="output"
                  />
                </div>
              </div>
            )}

            {/* Connection Button */}
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="mx-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
              >
                <Phone className="w-5 h-5" />
                Start Voice Chat
              </button>
            ) : (
              <div className="space-y-4">
                <VoiceControls
                  isConnected={isConnected}
                  isRecording={isRecording}
                  isMuted={isMuted}
                  mode={voiceMode}
                  onToggleMute={handleToggleMute}
                  onModeChange={handleModeChange}
                  onPushToTalk={handlePushToTalk}
                />
                
                <button
                  onClick={handleDisconnect}
                  className="mx-auto px-6 py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </button>
              </div>
            )}
          </div>

          {/* Switch to Text Button */}
          <div className="pt-4 border-t border-border mt-6">
            <button
              onClick={onSwitchToText}
              className="w-full px-4 py-2 text-sm text-text-muted hover:text-foreground border border-border rounded-lg hover:bg-card-hover transition-colors"
            >
              Switch to Text Mode
            </button>
          </div>
        </div>

          {/* Right Panel - Transcript */}
          <div className="flex-1 flex flex-col bg-background">
            <div className="border-b border-border p-4">
              <h3 className="font-medium">Conversation Transcript</h3>
            </div>
            <TranscriptView 
              entries={transcriptEntries}
              agentName={agentName}
              agentAvatar={agentAvatar}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex-1">
          <MobileVoiceLayout
            controls={
              <div className="p-4 bg-card space-y-6">
                {/* Agent Info */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 relative">
                    {agentAvatar ? (
                      <img 
                        src={agentAvatar} 
                        alt={agentName}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                    )}
                    {isConnected && (
                      <div className={cn(
                        "absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-card",
                        isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"
                      )} />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold">{agentName}</h2>
                  <p className="text-xs text-text-muted mt-1">
                    {isConnected ? `Voice chat active (${selectedVoice})` : 'Ready to connect'}
                  </p>
                </div>

                {/* Voice Selector - Mobile */}
                {!isConnected && (
                  <div className="space-y-2">
                    <p className="text-xs text-text-muted text-center">Select Voice</p>
                    <VoiceSelector
                      selectedVoice={selectedVoice}
                      onVoiceChange={setSelectedVoice}
                      disabled={connectionState !== 'idle'}
                      className="text-sm"
                    />
                  </div>
                )}

                {/* Audio Visualizers */}
                {isConnected && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-text-muted mb-1 text-center">Your Voice</p>
                      <AudioVisualizer 
                        isActive={isRecording && !isMuted} 
                        audioLevel={inputAudioLevel}
                        type="input"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1 text-center">{agentName}'s Voice</p>
                      <AudioVisualizer 
                        isActive={isPlaying} 
                        audioLevel={outputAudioLevel}
                        type="output"
                      />
                    </div>
                  </div>
                )}

                {/* Connection Button */}
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Start Voice Chat
                  </button>
                ) : (
                  <div className="space-y-3">
                    <VoiceControls
                      isConnected={isConnected}
                      isRecording={isRecording}
                      isMuted={isMuted}
                      mode={voiceMode}
                      onToggleMute={handleToggleMute}
                      onModeChange={handleModeChange}
                      onPushToTalk={handlePushToTalk}
                      className="scale-90"
                    />
                    
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <PhoneOff className="w-4 h-4" />
                      End Call
                    </button>
                  </div>
                )}

                {/* Switch to Text Button */}
                <button
                  onClick={onSwitchToText}
                  className="w-full px-4 py-2 text-sm text-text-muted hover:text-foreground border border-border rounded-lg hover:bg-card-hover transition-colors"
                >
                  Switch to Text Mode
                </button>
              </div>
            }
            transcript={
              <TranscriptView 
                entries={transcriptEntries}
                agentName={agentName}
                agentAvatar={agentAvatar}
              />
            }
          />
        </div>
      </div>

      {/* Mobile HTTPS Warning */}
      {!isConnected && typeof window !== 'undefined' && window.location.protocol === 'http:' && (
        <div className="lg:hidden bg-yellow-50 dark:bg-yellow-950/30 border-t border-yellow-200 dark:border-yellow-800 p-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Voice chat requires HTTPS on mobile. Use: 
            <code className="text-xs bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">
              https://{typeof window !== 'undefined' && window.location.host}
            </code>
          </p>
        </div>
      )}
    </div>
  )
}