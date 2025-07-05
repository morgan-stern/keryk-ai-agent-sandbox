'use client'

import { useState } from 'react'
import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileVoiceLayoutProps {
  controls: React.ReactNode
  transcript: React.ReactNode
  className?: string
}

export function MobileVoiceLayout({ controls, transcript, className }: MobileVoiceLayoutProps) {
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Controls Section - Always visible */}
      <div className="flex-shrink-0">
        {controls}
      </div>

      {/* Transcript Toggle Button */}
      <button
        onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
        className={cn(
          "flex items-center justify-between w-full p-4",
          "bg-card border-t border-b border-border",
          "hover:bg-card-hover transition-colors"
        )}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-text-muted" />
          <span className="font-medium">Conversation Transcript</span>
        </div>
        {isTranscriptExpanded ? (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        )}
      </button>

      {/* Transcript Section - Expandable */}
      <div
        className={cn(
          "flex-1 overflow-hidden transition-all duration-300",
          isTranscriptExpanded ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="h-full overflow-y-auto">
          {transcript}
        </div>
      </div>
    </div>
  )
}