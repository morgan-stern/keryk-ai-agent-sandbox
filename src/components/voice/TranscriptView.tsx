'use client'

import { useEffect, useRef } from 'react'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export interface TranscriptEntry {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isInterim?: boolean
}

interface TranscriptViewProps {
  entries: TranscriptEntry[]
  agentName: string
  agentAvatar?: string
}

export function TranscriptView({ entries, agentName, agentAvatar }: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-text-muted text-sm">Your conversation will appear here</p>
          <p className="text-text-muted/60 text-xs mt-2">Start speaking to begin</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex gap-3 ${
            entry.role === 'user' ? 'flex-row-reverse' : ''
          } ${entry.isInterim ? 'opacity-60' : ''}`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {entry.role === 'user' ? (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            ) : agentAvatar ? (
              <img 
                src={agentAvatar} 
                alt={agentName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* Message bubble */}
          <div className={`group max-w-[70%] ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`relative px-4 py-2 rounded-2xl ${
                entry.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-card border border-border'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              
              {/* Copy button */}
              <button
                onClick={() => handleCopy(entry.content, entry.id)}
                className={`absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md ${
                  entry.role === 'user'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-card-hover border border-border'
                }`}
              >
                {copiedId === entry.id ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Timestamp */}
            <p className={`text-xs text-text-muted mt-1 px-2 ${
              entry.role === 'user' ? 'text-right' : 'text-left'
            }`}>
              {formatTime(entry.timestamp)}
              {entry.isInterim && ' • Transcribing...'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}