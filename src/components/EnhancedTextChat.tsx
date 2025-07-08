import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

interface EnhancedTextChatProps {
  messages: Message[]
  isTyping: boolean
  className?: string
}

function formatAgentMessage(content: string): JSX.Element {
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
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export function EnhancedTextChat({ messages, isTyping, className }: EnhancedTextChatProps) {
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
                  "break-words font-body",
                  message.role === 'user'
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-card border border-border text-foreground rounded-bl-sm"
                )}
                onDoubleClick={() => handleCopyMessage(message.content)}
              >
                {message.role === 'assistant' ? (
                  formatAgentMessage(message.content)
                ) : (
                  <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                )}
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

export default EnhancedTextChat