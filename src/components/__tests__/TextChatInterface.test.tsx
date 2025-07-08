import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TextChatInterface } from '../TextChatInterface'

// Mock the useAgentChat hook
jest.mock('@/hooks/useAgentChat', () => ({
  useAgentChat: jest.fn(() => ({
    messages: [
      {
        id: 'welcome',
        content: 'Hi! I\'m Test Agent. How can I help you today?',
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
    ],
    isTyping: false,
    isProcessing: false,
    isOnline: true,
    sendMessage: jest.fn(),
    retryMessage: jest.fn(),
    hasFailedMessages: false,
    hasPendingMessages: false
  }))
}))

describe('TextChatInterface', () => {
  const defaultProps = {
    agentId: 'test-agent',
    agentName: 'Test Agent'
  }

  it('renders the chat interface', () => {
    render(<TextChatInterface {...defaultProps} />)
    
    expect(screen.getByText('Hi! I\'m Test Agent. How can I help you today?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })

  it('shows offline indicator when not online', () => {
    const { useAgentChat } = require('@/hooks/useAgentChat')
    useAgentChat.mockReturnValueOnce({
      messages: [],
      isTyping: false,
      isProcessing: false,
      isOnline: false,
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      hasFailedMessages: false,
      hasPendingMessages: false
    })

    render(<TextChatInterface {...defaultProps} />)
    
    expect(screen.getByText('You\'re offline. Messages will be sent when connection is restored.')).toBeInTheDocument()
  })

  it('shows failed messages indicator', () => {
    const { useAgentChat } = require('@/hooks/useAgentChat')
    useAgentChat.mockReturnValueOnce({
      messages: [],
      isTyping: false,
      isProcessing: false,
      isOnline: true,
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      hasFailedMessages: true,
      hasPendingMessages: false
    })

    render(<TextChatInterface {...defaultProps} />)
    
    expect(screen.getByText('Some messages failed to send. They will be retried automatically.')).toBeInTheDocument()
  })

  it('shows processing state', () => {
    const { useAgentChat } = require('@/hooks/useAgentChat')
    useAgentChat.mockReturnValueOnce({
      messages: [],
      isTyping: false,
      isProcessing: true,
      isOnline: true,
      sendMessage: jest.fn(),
      retryMessage: jest.fn(),
      hasFailedMessages: false,
      hasPendingMessages: false
    })

    render(<TextChatInterface {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Agent is thinking...')).toBeInTheDocument()
  })
})