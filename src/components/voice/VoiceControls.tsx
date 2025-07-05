'use client'

import { useState, useEffect } from 'react'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Keyboard,
  Hand,
  Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceControlsProps {
  isConnected: boolean
  isRecording: boolean
  isMuted: boolean
  mode: 'push-to-talk' | 'auto-detect'
  onToggleMute: () => void
  onModeChange: (mode: 'push-to-talk' | 'auto-detect') => void
  onPushToTalk?: (active: boolean) => void
  className?: string
}

export function VoiceControls({
  isConnected,
  isRecording,
  isMuted,
  mode,
  onToggleMute,
  onModeChange,
  onPushToTalk,
  className
}: VoiceControlsProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')

  // Get available audio devices
  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(device => device.kind === 'audioinput')
        setAudioDevices(audioInputs)
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      } catch (error) {
        console.error('Failed to enumerate devices:', error)
      }
    }

    loadDevices()
    // Reload devices when they change
    navigator.mediaDevices.addEventListener('devicechange', loadDevices)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices)
    }
  }, [selectedDevice])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isConnected) return

      // Space bar for push-to-talk
      if (e.code === 'Space' && mode === 'push-to-talk' && !e.repeat) {
        e.preventDefault()
        setIsPushToTalkActive(true)
        onPushToTalk?.(true)
      }

      // Cmd/Ctrl + M to toggle mute
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault()
        onToggleMute()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && mode === 'push-to-talk') {
        e.preventDefault()
        setIsPushToTalkActive(false)
        onPushToTalk?.(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isConnected, mode, onToggleMute, onPushToTalk])

  // Handle push-to-talk button
  const handlePushToTalkMouseDown = () => {
    if (mode === 'push-to-talk') {
      setIsPushToTalkActive(true)
      onPushToTalk?.(true)
    }
  }

  const handlePushToTalkMouseUp = () => {
    if (mode === 'push-to-talk') {
      setIsPushToTalkActive(false)
      onPushToTalk?.(false)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          disabled={!isConnected}
          className={cn(
            "p-4 rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            isMuted 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-card border border-border hover:bg-card-hover",
            !isConnected && "opacity-50 cursor-not-allowed"
          )}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Push to Talk Button (if in PTT mode) */}
        {mode === 'push-to-talk' && (
          <button
            onMouseDown={handlePushToTalkMouseDown}
            onMouseUp={handlePushToTalkMouseUp}
            onMouseLeave={handlePushToTalkMouseUp}
            disabled={!isConnected || isMuted}
            className={cn(
              "px-6 py-4 rounded-full transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "select-none cursor-pointer",
              isPushToTalkActive 
                ? "bg-green-500 text-white scale-110" 
                : "bg-card border border-border hover:bg-card-hover",
              (!isConnected || isMuted) && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Push to talk"
          >
            <div className="flex items-center gap-2">
              <Hand className="w-5 h-5" />
              <span className="font-medium">
                {isPushToTalkActive ? 'Speaking...' : 'Hold to Talk'}
              </span>
            </div>
          </button>
        )}

        {/* Settings Toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "p-4 rounded-full transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            showSettings 
              ? "bg-primary text-white" 
              : "bg-card border border-border hover:bg-card-hover"
          )}
          aria-label="Voice settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isRecording ? "bg-green-500 animate-pulse" : "bg-gray-300"
        )} />
        <span className="text-text-muted">
          {isRecording ? 'Listening...' : 'Silent'}
        </span>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-card border border-border rounded-lg space-y-4">
          {/* Mode Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Voice Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onModeChange('auto-detect')}
                className={cn(
                  "px-3 py-2 rounded-md text-sm transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  mode === 'auto-detect'
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:bg-card-hover"
                )}
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <span>Auto Detect</span>
                </div>
              </button>
              <button
                onClick={() => onModeChange('push-to-talk')}
                className={cn(
                  "px-3 py-2 rounded-md text-sm transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  mode === 'push-to-talk'
                    ? "bg-primary text-white"
                    : "bg-background border border-border hover:bg-card-hover"
                )}
              >
                <div className="flex items-center gap-2">
                  <Hand className="w-4 h-4" />
                  <span>Push to Talk</span>
                </div>
              </button>
            </div>
          </div>

          {/* Audio Device Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4" />
                <span>Microphone</span>
              </div>
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Keyboard className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-foreground">Keyboard Shortcuts</span>
            </div>
            <div className="space-y-1 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Toggle Mute</span>
                <kbd className="px-2 py-0.5 bg-background border border-border rounded">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + M
                </kbd>
              </div>
              {mode === 'push-to-talk' && (
                <div className="flex justify-between">
                  <span>Push to Talk</span>
                  <kbd className="px-2 py-0.5 bg-background border border-border rounded">
                    Space
                  </kbd>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}