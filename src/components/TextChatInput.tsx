'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TextChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  autoFocus?: boolean
  maxLength?: number
}

export function TextChatInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = 'Type your message...',
  className,
  autoFocus = false,
  maxLength = 500
}: TextChatInputProps) {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [message])

  // Focus management
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
      
      // Keep focus on input for continuous messaging
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const charactersRemaining = maxLength - message.length
  const isNearLimit = charactersRemaining < 50

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-2 p-4 bg-card border-t border-border",
        className
      )}
    >
      <div className="flex-1 relative">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "w-full bg-background rounded-lg px-4 py-3 pr-12",
            "text-foreground placeholder:text-text-muted",
            "resize-none overflow-hidden",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[48px] max-h-[120px]",
            "transition-all duration-200",
            "font-body text-base"
          )}
          style={{ 
            height: 'auto',
            // Ensure proper mobile keyboard behavior
            fontSize: '16px' // Prevents zoom on iOS
          }}
        />
        
        {/* Character count indicator */}
        {message.length > 0 && (
          <span 
            className={cn(
              "absolute bottom-3 right-3 text-xs",
              isNearLimit ? "text-warning" : "text-text-muted"
            )}
          >
            {charactersRemaining}
          </span>
        )}
      </div>
      
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center",
          "bg-primary text-white",
          "hover:bg-primary-hover active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200",
          "touch-manipulation", // Improves touch response
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  )
}