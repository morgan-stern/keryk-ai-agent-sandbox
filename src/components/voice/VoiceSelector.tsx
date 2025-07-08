'use client'

import { useState } from 'react'
import { Volume2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceOption {
  id: string
  name: string
  description: string
  gender: 'male' | 'female' | 'neutral'
  style: string
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'alloy',
    name: 'Alloy',
    description: 'Neutral and balanced',
    gender: 'neutral',
    style: 'Professional and clear'
  },
  {
    id: 'ash',
    name: 'Ash',
    description: 'Warm and conversational',
    gender: 'male',
    style: 'Friendly and natural'
  },
  {
    id: 'ballad',
    name: 'Ballad',
    description: 'Expressive and emotive',
    gender: 'female',
    style: 'Rich and melodic'
  },
  {
    id: 'coral',
    name: 'Coral',
    description: 'Bright and cheerful',
    gender: 'female',
    style: 'Energetic and friendly'
  },
  {
    id: 'echo',
    name: 'Echo',
    description: 'Smooth and versatile',
    gender: 'male',
    style: 'Clear and engaging'
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Wise and thoughtful',
    gender: 'neutral',
    style: 'Calm and authoritative'
  },
  {
    id: 'shimmer',
    name: 'Shimmer',
    description: 'Soft and soothing',
    gender: 'female',
    style: 'Gentle and warm'
  },
  {
    id: 'verse',
    name: 'Verse',
    description: 'Dynamic and articulate',
    gender: 'male',
    style: 'Confident and expressive'
  }
]

interface VoiceSelectorProps {
  selectedVoice: string
  onVoiceChange: (voice: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceSelector({ 
  selectedVoice, 
  onVoiceChange, 
  disabled = false,
  className 
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  const selectedOption = VOICE_OPTIONS.find(v => v.id === selectedVoice) || VOICE_OPTIONS[0]

  const playVoiceSample = async (voiceId: string) => {
    // In a real implementation, this would play a sample of the voice
    // For now, we'll just simulate it
    setIsPlaying(voiceId)
    setTimeout(() => setIsPlaying(null), 2000)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 text-left bg-card border border-border rounded-lg",
          "hover:bg-card-hover transition-colors",
          "flex items-center justify-between gap-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isOpen && "border-primary"
        )}
      >
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-text-muted" />
          <div>
            <p className="text-sm font-medium">{selectedOption.name}</p>
            <p className="text-xs text-text-muted">{selectedOption.description}</p>
          </div>
        </div>
        <div className="text-xs text-text-muted">
          {isOpen ? '▴' : '▾'}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
              {VOICE_OPTIONS.map((voice) => {
                const isSelected = voice.id === selectedVoice
                const isCurrentlyPlaying = isPlaying === voice.id
                
                return (
                  <button
                    key={voice.id}
                    onClick={() => {
                      onVoiceChange(voice.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-all",
                      "hover:bg-background-hover",
                      isSelected && "bg-primary/10 hover:bg-primary/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm font-medium",
                            isSelected && "text-primary"
                          )}>
                            {voice.name}
                          </p>
                          {isSelected && (
                            <Check className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {voice.style}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            voice.gender === 'male' && "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
                            voice.gender === 'female' && "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300",
                            voice.gender === 'neutral' && "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          )}>
                            {voice.gender}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          playVoiceSample(voice.id)
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          "hover:bg-background hover:text-primary",
                          isCurrentlyPlaying && "bg-primary/10 text-primary animate-pulse"
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="border-t border-border p-3">
              <p className="text-xs text-text-muted text-center">
                Click the speaker icon to preview each voice
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}