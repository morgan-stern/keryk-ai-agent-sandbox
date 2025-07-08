'use client'

import { useEffect } from 'react'
import { useAgentChat } from '@/hooks/useAgentChat'
import { EnhancedTextChat } from './EnhancedTextChat'
import { TextChatInput } from './TextChatInput'
import { cn } from '@/lib/utils'
import { AlertCircle, WifiOff } from 'lucide-react'

interface FormattedTextChatInterfaceProps {
  agentId: string
  agentName: string
  className?: string
  onError?: (error: Error) => void
  onMessageSent?: (message: string) => void
}

export function FormattedTextChatInterface({
  agentId,
  agentName,
  className,
  onError,
  onMessageSent
}: FormattedTextChatInterfaceProps) {
  const {
    messages,
    isTyping,
    isProcessing,
    isOnline,
    sendMessage,
    retryMessage,
    hasFailedMessages,
    hasPendingMessages
  } = useAgentChat({
    agentId,
    onError,
    onMessageSent,
    initialMessages: [{
      id: 'welcome',
      content: `Hi! I'm ${agentName}. How can I help you today?`,
      role: 'assistant',
      timestamp: new Date().toISOString()
    }]
  })

  // Convert messages to the format expected by EnhancedTextChat
  const chatMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    timestamp: msg.timestamp
  }))

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-warning">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Messages will be sent when connection is restored.</span>
          </div>
        </div>
      )}

      {/* Failed messages indicator */}
      {hasFailedMessages && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>Some messages failed to send. They will be retried automatically.</span>
          </div>
        </div>
      )}

      {/* Chat messages with enhanced formatting */}
      <EnhancedTextChat 
        messages={chatMessages} 
        isTyping={isTyping}
        className="flex-1"
      />

      {/* Input */}
      <TextChatInput
        onSendMessage={sendMessage}
        disabled={isProcessing}
        placeholder={isProcessing ? "Agent is thinking..." : "Type your message..."}
        autoFocus
      />

      {/* Pending messages indicator */}
      {hasPendingMessages && (
        <div className="px-4 py-2 text-xs text-text-muted text-center">
          Messages pending...
        </div>
      )}
    </div>
  )
}

export default FormattedTextChatInterface