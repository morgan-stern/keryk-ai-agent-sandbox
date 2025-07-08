'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Mic, MicOff } from 'lucide-react'
import { useAgentAPI } from '@/hooks/useAgentAPI'
import { VoiceMode } from './VoiceMode'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import { cn } from '@/lib/utils'
import { api } from '@/services/api'

interface EnhancedChatInterfaceProps {
  agentId: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Simple voice input class
class SimpleVoiceInput {
  private recognition: any = null
  private isListening = false
  private onResult?: (transcript: string) => void
  private onError?: (error: string) => void

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'
        
        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          this.onResult?.(transcript)
        }
        
        this.recognition.onerror = (event: any) => {
          this.onError?.(`Speech recognition error: ${event.error}`)
          this.isListening = false
        }
        
        this.recognition.onend = () => {
          this.isListening = false
        }
      }
    }
  }

  setCallbacks(onResult: (transcript: string) => void, onError: (error: string) => void) {
    this.onResult = onResult
    this.onError = onError
  }

  start() {
    if (!this.recognition) {
      this.onError?.('Speech recognition not supported in this browser')
      return
    }

    if (this.isListening) {
      return
    }

    try {
      this.recognition.start()
      this.isListening = true
    } catch (error) {
      this.onError?.('Failed to start speech recognition')
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  isSupported() {
    return !!this.recognition
  }

  getIsListening() {
    return this.isListening
  }
}

// Enhanced message formatting function
function formatMessage(content: string, role: 'user' | 'assistant'): JSX.Element {
  if (role === 'user') {
    return <span>{content}</span>
  }

  // Split by paragraphs (double newlines)
  const paragraphs = content.split('\n\n')
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        // Check if it's a numbered list
        if (paragraph.match(/^\d+\.\s/)) {
          const listItems = paragraph.split('\n').filter(line => line.trim())
          return (
            <ol key={index} className="list-decimal ml-4 space-y-2">
              {listItems.map((item, itemIndex) => {
                const cleanItem = item.replace(/^\d+\.\s/, '')
                return (
                  <li key={itemIndex} className="text-sm leading-relaxed">
                    {formatInlineElements(cleanItem)}
                  </li>
                )
              })}
            </ol>
          )
        }
        
        // Check if it's a bulleted list
        if (paragraph.match(/^[-*]\s/)) {
          const listItems = paragraph.split('\n').filter(line => line.trim())
          return (
            <ul key={index} className="list-disc ml-4 space-y-2">
              {listItems.map((item, itemIndex) => {
                const cleanItem = item.replace(/^[-*]\s/, '')
                return (
                  <li key={itemIndex} className="text-sm leading-relaxed">
                    {formatInlineElements(cleanItem)}
                  </li>
                )
              })}
            </ul>
          )
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-sm leading-relaxed">
            {formatInlineElements(paragraph)}
          </p>
        )
      })}
    </div>
  )
}

// Format inline elements like bold, italic, etc.
function formatInlineElements(text: string): (string | JSX.Element)[] {
  // Handle bold text (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export function EnhancedChatInterface({ agentId }: EnhancedChatInterfaceProps) {
  const router = useRouter()
  const { user } = useAuthCheck()
  const { agent, loading, error } = useAgentAPI(agentId)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const voiceInputRef = useRef<SimpleVoiceInput | null>(null)

  // Initialize voice input
  useEffect(() => {
    voiceInputRef.current = new SimpleVoiceInput()
    voiceInputRef.current.setCallbacks(
      (transcript) => {
        setInputMessage(transcript)
        setIsRecording(false)
        setVoiceError(null)
      },
      (error) => {
        setVoiceError(error)
        setIsRecording(false)
        setTimeout(() => setVoiceError(null), 5000)
      }
    )
  }, [])

  useEffect(() => {
    if (!loading && agent && user?.isAnonymous && !agent.isTestAgent) {
      router.push('/')
    }
  }, [agent, loading, user, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date().toISOString()
    }])
    setIsSending(true)

    try {
      const { data, error } = await api.agents.sendMessage(agentId, userMessage)
      
      if (error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${error}`,
          timestamp: new Date().toISOString()
        }])
      } else if (data?.response) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response.message,
          timestamp: data.response.timestamp
        }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsSending(false)
    }
  }

  const handleVoiceRecord = async () => {
    if (!voiceInputRef.current) return

    if (isRecording) {
      voiceInputRef.current.stop()
      setIsRecording(false)
    } else {
      if (voiceInputRef.current.isSupported()) {
        voiceInputRef.current.start()
        setIsRecording(true)
        setVoiceError(null)
      } else {
        setVoiceError('Speech recognition not supported in this browser')
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-muted font-body">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-heading text-foreground">Agent not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium font-body text-sm"
          >
            Back to agents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-background rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold font-heading">{agent.name}</h1>
          <p className="text-xs text-text-muted font-body">{agent.description}</p>
        </div>
        {agent.supportedModes.includes('voice') && (
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isVoiceMode ? "bg-primary text-white" : "hover:bg-background"
            )}
            aria-label="Toggle voice mode"
          >
            {isVoiceMode ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        )}
      </header>

      {/* Voice Error Display */}
      {voiceError && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <p className="text-sm text-destructive">{voiceError}</p>
        </div>
      )}

      {/* Content */}
      {isVoiceMode ? (
        <VoiceMode
          agentId={agentId}
          agentName={agent.name}
          agentAvatar={agent.avatar}
          onSwitchToText={() => setIsVoiceMode(false)}
        />
      ) : (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-text-muted font-body mt-8">
                <p>Start a conversation with {agent.name}</p>
                <p className="text-xs mt-2">💡 Try the microphone button to record voice messages</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-4 py-2 rounded-2xl font-body",
                    message.role === 'user'
                      ? "bg-primary text-white"
                      : "bg-card border border-border"
                  )}
                >
                  {formatMessage(message.content, message.role)}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-4 py-2 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message or use voice recording..."
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg resize-none font-body focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                rows={1}
              />
              
              {/* Voice Recording Button */}
              <button
                onClick={handleVoiceRecord}
                disabled={isSending}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  isRecording && "bg-red-500 text-white animate-pulse",
                  !isRecording && "hover:bg-background text-text-muted hover:text-foreground",
                  isSending && "opacity-50 cursor-not-allowed"
                )}
                aria-label={isRecording ? "Stop recording" : "Start voice recording"}
                title="Record voice message (uses browser speech recognition)"
              >
                {isRecording ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </button>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSending}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EnhancedChatInterface