import { useState, useEffect, useCallback } from 'react'

interface QueuedMessage {
  id: string
  content: string
  timestamp: Date
  status: 'pending' | 'sending' | 'sent' | 'failed'
}

export function useMessageQueue() {
  const [queue, setQueue] = useState<QueuedMessage[]>([])
  const [isOnline, setIsOnline] = useState(true)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  const addToQueue = useCallback((content: string) => {
    const message: QueuedMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      status: isOnline ? 'sending' : 'pending',
    }
    
    setQueue(prev => [...prev, message])
    return message.id
  }, [isOnline])
  
  const updateMessageStatus = useCallback((id: string, status: QueuedMessage['status']) => {
    setQueue(prev => prev.map(msg => 
      msg.id === id ? { ...msg, status } : msg
    ))
  }, [])
  
  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(msg => msg.id !== id))
  }, [])
  
  const processPendingMessages = useCallback(() => {
    setQueue(prev => prev.map(msg => 
      msg.status === 'pending' ? { ...msg, status: 'sending' } : msg
    ))
  }, [])
  
  // Process pending messages when coming back online
  useEffect(() => {
    if (isOnline) {
      processPendingMessages()
    }
  }, [isOnline, processPendingMessages])
  
  return {
    queue,
    isOnline,
    addToQueue,
    updateMessageStatus,
    removeFromQueue,
  }
}