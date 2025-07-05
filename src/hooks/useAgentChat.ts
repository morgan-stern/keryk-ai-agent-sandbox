'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { agentService } from '@/services/agentService'
import { useMessageQueue } from './useMessageQueue'

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  status?: 'sending' | 'sent' | 'failed'
  error?: string
}

interface UseAgentChatOptions {
  agentId: string
  onError?: (error: Error) => void
  onMessageSent?: (message: string) => void
  initialMessages?: ChatMessage[]
}

export function useAgentChat({
  agentId,
  onError,
  onMessageSent,
  initialMessages = []
}: UseAgentChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { queue, isOnline, addToQueue, updateMessageStatus, removeFromQueue } = useMessageQueue()
  const abortControllerRef = useRef<AbortController | null>(null)

  // Process messages from the queue
  useEffect(() => {
    const processQueue = async () => {
      const pendingMessages = queue.filter(msg => msg.status === 'sending')
      
      for (const queuedMessage of pendingMessages) {
        try {
          const response = await sendMessageToAgent(queuedMessage.content)
          
          if (response) {
            // Update the message status in the main messages array
            setMessages(prev => prev.map(msg => 
              msg.id === queuedMessage.id 
                ? { ...msg, status: 'sent' as const } 
                : msg
            ))
            
            // Add agent response
            setMessages(prev => [...prev, {
              id: `${Date.now()}-agent`,
              content: response.message,
              role: 'assistant' as const,
              timestamp: response.timestamp || new Date().toISOString(),
              status: 'sent' as const
            }])
            
            // Remove from queue after successful send
            removeFromQueue(queuedMessage.id)
          }
        } catch (error) {
          console.error('Error processing queued message:', error)
          updateMessageStatus(queuedMessage.id, 'failed')
          
          // Update the message status in the main messages array
          setMessages(prev => prev.map(msg => 
            msg.id === queuedMessage.id 
              ? { ...msg, status: 'failed' as const, error: error instanceof Error ? error.message : 'Unknown error' } 
              : msg
          ))
        }
      }
    }

    if (isOnline && queue.length > 0) {
      processQueue()
    }
  }, [queue, isOnline, removeFromQueue, updateMessageStatus])

  const sendMessageToAgent = async (content: string) => {
    try {
      const response = await agentService.sendMessage(agentId, content)
      return response
    } catch (error) {
      throw error
    }
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      status: isOnline ? 'sending' : 'failed'
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    
    // Call the callback if provided
    onMessageSent?.(content.trim())

    if (!isOnline) {
      // Add to queue for later processing
      addToQueue(content.trim())
      return
    }

    setIsProcessing(true)
    setIsTyping(true)

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await sendMessageToAgent(content)
      
      if (response) {
        // Update user message status
        setMessages(prev => prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' as const } 
            : msg
        ))

        // Add agent response
        const agentMessage: ChatMessage = {
          id: `${Date.now()}-agent`,
          content: response.message,
          role: 'assistant',
          timestamp: response.timestamp || new Date().toISOString(),
          status: 'sent'
        }
        
        setMessages(prev => [...prev, agentMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Update message status to failed
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { 
              ...msg, 
              status: 'failed' as const, 
              error: error instanceof Error ? error.message : 'Failed to send message' 
            } 
          : msg
      ))
      
      // Add to queue for retry
      addToQueue(content.trim())
      
      // Call error handler if provided
      if (error instanceof Error) {
        onError?.(error)
      }
    } finally {
      setIsProcessing(false)
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }, [agentId, isOnline, isProcessing, addToQueue, onError, onMessageSent])

  const retryMessage = useCallback(async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId)
    if (message && message.status === 'failed') {
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      // Resend the message
      await sendMessage(message.content)
    }
  }, [messages, sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsProcessing(false)
      setIsTyping(false)
    }
  }, [])

  return {
    messages,
    isTyping,
    isProcessing,
    isOnline,
    sendMessage,
    retryMessage,
    clearMessages,
    cancelCurrentRequest,
    hasFailedMessages: messages.some(msg => msg.status === 'failed'),
    hasPendingMessages: queue.length > 0
  }
}