'use client'

import { Mic, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModeToggleProps {
  mode: 'text' | 'voice'
  onModeChange: (mode: 'text' | 'voice') => void
  supportedModes?: ('text' | 'voice')[]
  disabled?: boolean
  className?: string
  voiceEnabled?: boolean // Kept for backwards compatibility
}

export function ModeToggle({ 
  mode, 
  onModeChange, 
  supportedModes,
  disabled = false,
  className,
  voiceEnabled = true 
}: ModeToggleProps) {
  // Use supportedModes if provided, otherwise fall back to legacy voiceEnabled behavior
  const modes = supportedModes || (voiceEnabled ? ['text', 'voice'] : ['text']) as ('text' | 'voice')[]
  
  // Don't render if only one mode is supported
  if (modes.length <= 1) return null
  
  return (
    <div className={cn(
      "flex bg-card rounded-full p-1 border border-border shadow-sm",
      "transition-all duration-200",
      disabled && "opacity-50",
      className
    )}>
      {modes.includes('text') && (
        <button
          onClick={() => !disabled && onModeChange('text')}
          disabled={disabled}
          className={cn(
            'relative flex items-center gap-2 px-5 py-2.5 rounded-full',
            'min-h-[44px] touch-manipulation',
            'transition-all duration-300 transform',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
            mode === 'text' 
              ? 'bg-primary text-white shadow-md scale-105' 
              : 'text-text-muted hover:text-foreground hover:bg-background/50',
            disabled && 'cursor-not-allowed'
          )}
          aria-label="Switch to text chat"
          aria-pressed={mode === 'text'}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">Text</span>
          {mode === 'text' && (
            <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
          )}
        </button>
      )}
      
      {modes.includes('voice') && (
        <button
          onClick={() => !disabled && onModeChange('voice')}
          disabled={disabled}
          className={cn(
            'relative flex items-center gap-2 px-5 py-2.5 rounded-full',
            'min-h-[44px] touch-manipulation',
            'transition-all duration-300 transform',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
            mode === 'voice' 
              ? 'bg-primary text-white shadow-md scale-105' 
              : 'text-text-muted hover:text-foreground hover:bg-background/50',
            disabled && 'cursor-not-allowed'
          )}
          aria-label="Switch to voice chat"
          aria-pressed={mode === 'voice'}
        >
          <Mic className="w-4 h-4" />
          <span className="text-sm font-medium">Voice</span>
          {mode === 'voice' && (
            <span className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
          )}
        </button>
      )}
    </div>
  )
}