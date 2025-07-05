'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceChatProps {
  isListening?: boolean
  isSpeaking?: boolean
  transcript?: string
  lastAgentMessage?: string
  audioLevel?: number
  onConnectionChange?: (connected: boolean) => void
  onMuteChange?: (muted: boolean) => void
  className?: string
}

export function VoiceChat({ 
  isListening = false,
  isSpeaking = false,
  transcript = '',
  lastAgentMessage = '',
  audioLevel = 0,
  onConnectionChange,
  onMuteChange,
  className
}: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [waveformBars, setWaveformBars] = useState(Array(12).fill(0))
  const animationRef = useRef<number>()
  
  const handleConnect = () => {
    const newState = !isConnected
    setIsConnected(newState)
    onConnectionChange?.(newState)
  }
  
  const handleMute = () => {
    const newState = !isMuted
    setIsMuted(newState)
    onMuteChange?.(newState)
  }
  
  // Waveform animation
  useEffect(() => {
    if (isListening && !isMuted) {
      const animate = () => {
        setWaveformBars(prev => prev.map(() => 
          Math.random() * 60 + 20 + (audioLevel * 20)
        ))
        animationRef.current = requestAnimationFrame(animate)
      }
      animate()
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    } else {
      setWaveformBars(Array(12).fill(0))
    }
  }, [isListening, isMuted, audioLevel])
  
  return (
    <div className={cn("flex flex-col items-center justify-center h-full p-8", className)}>
      {/* Voice Activity Visualization */}
      <div className="relative mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Background circle */}
          <div
            className={cn(
              'absolute inset-0 rounded-full transition-all duration-300',
              isConnected
                ? isSpeaking
                  ? 'bg-accent/20 animate-pulse'
                  : isListening
                  ? 'bg-primary/20'
                  : 'bg-card border-2 border-primary'
                : 'bg-card border-2 border-border'
            )}
          />
          
          {/* Waveform visualization when listening */}
          {isListening && !isMuted && isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-1 h-20">
                {waveformBars.map((height, i) => (
                  <div
                    key={i}
                    className="w-2 bg-primary rounded-full transition-all duration-75"
                    style={{ 
                      height: `${height}%`,
                      opacity: height > 0 ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Speaking animation */}
          {isSpeaking && isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Volume2 className="w-12 h-12 text-accent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-accent/40 animate-ping" />
                </div>
              </div>
            </div>
          )}
          
          {/* Default microphone icon */}
          {!isListening && !isSpeaking && (
            <Mic
              className={cn(
                'relative z-10 w-12 h-12 transition-colors',
                isConnected
                  ? isMuted
                    ? 'text-text-muted'
                    : 'text-primary'
                  : 'text-text-muted'
              )}
            />
          )}
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          )} />
          <p className="text-lg font-medium">
            {isConnected ? 'Voice Chat Active' : 'Voice Chat Inactive'}
          </p>
        </div>
        <p className="text-sm text-text-muted">
          {isConnected
            ? isMuted
              ? 'Microphone muted'
              : isSpeaking
              ? 'Agent is speaking...'
              : isListening
              ? 'Listening to you...'
              : 'Ready for voice input'
            : 'Click to start voice chat'}
        </p>
      </div>
      
      {/* Transcript Display */}
      {transcript && isConnected && (
        <div className="w-full max-w-md mb-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <p className="text-sm font-medium text-text-muted">You said:</p>
            </div>
            <p className="text-foreground">{transcript}</p>
          </div>
        </div>
      )}
      
      {/* Agent Message Display */}
      {lastAgentMessage && isConnected && (
        <div className="w-full max-w-md mb-6">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <p className="text-sm font-medium text-text-muted">Agent said:</p>
            </div>
            <p className="text-foreground">{lastAgentMessage}</p>
          </div>
        </div>
      )}
      
      {/* Control Buttons */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleConnect}
          className={cn(
            'relative p-4 rounded-full transition-all duration-200 touch-manipulation',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            isConnected
              ? 'bg-destructive hover:bg-destructive-hover text-white focus:ring-destructive'
              : 'bg-primary hover:bg-primary-hover text-white focus:ring-primary'
          )}
          aria-label={isConnected ? 'End voice chat' : 'Start voice chat'}
        >
          {isConnected ? (
            <PhoneOff className="w-6 h-6" />
          ) : (
            <Phone className="w-6 h-6" />
          )}
          {/* Ripple effect on click */}
          <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300" />
        </button>
        
        {isConnected && (
          <button
            onClick={handleMute}
            className={cn(
              'relative p-4 rounded-full transition-all duration-200 touch-manipulation',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              isMuted
                ? 'bg-card border-2 border-border text-text-muted focus:ring-border'
                : 'bg-card border-2 border-primary text-primary focus:ring-primary'
            )}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-active:scale-100 transition-transform duration-300" />
          </button>
        )}
      </div>
    </div>
  )
}