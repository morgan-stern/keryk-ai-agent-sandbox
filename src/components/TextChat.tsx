import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

interface TextChatProps {
  messages: Message[]
  isTyping: boolean
  className?: string
}

export function TextChat({ messages, isTyping, className }: TextChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div 
      ref={scrollRef}
      className={cn("flex-1 overflow-y-auto", className)}
    >
      <div className="px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] group relative",
                message.role === 'user' ? "order-1" : "order-2"
              )}
            >
              {/* Message bubble */}
              <div
                className={cn(
                  "px-4 py-3 rounded-2xl transition-all duration-200",
                  "break-words whitespace-pre-wrap font-body text-sm",
                  message.role === 'user'
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm"
                )}
                onDoubleClick={() => handleCopyMessage(message.content)}
              >
                {message.content}
              </div>
              
              {/* Timestamp on hover */}
              <div className={cn(
                "absolute -bottom-5 text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity",
                message.role === 'user' ? "right-0" : "left-0"
              )}>
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-2 h-2 bg-text-muted rounded-full animate-bounce" 
                      style={{ animationDelay: '0ms' }} />
                <span className="typing-dot w-2 h-2 bg-text-muted rounded-full animate-bounce" 
                      style={{ animationDelay: '150ms' }} />
                <span className="typing-dot w-2 h-2 bg-text-muted rounded-full animate-bounce" 
                      style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
