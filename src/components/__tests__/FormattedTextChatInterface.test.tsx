import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FormattedTextChatInterface } from '../FormattedTextChatInterface'

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

describe('FormattedTextChatInterface', () => {
  const defaultProps = {
    agentId: 'test-agent',
    agentName: 'Test Agent'
  }

  it('renders the chat interface with formatted messages', () => {
    render(<FormattedTextChatInterface {...defaultProps} />)
    
    expect(screen.getByText('Hi! I\'m Test Agent. How can I help you today?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
  })

  it('formats numbered lists properly', () => {
    const { useAgentChat } = require('@/hooks/useAgentChat')
    useAgentChat.mockReturnValueOnce({
      messages: [
        {
          id: '1',
          content: '1. First item\n2. Second item\n3. Third item',
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
    })

    render(<FormattedTextChatInterface {...defaultProps} />)
    
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
    expect(screen.getByText('Third item')).toBeInTheDocument()
  })

  it('formats bold text properly', () => {
    const { useAgentChat } = require('@/hooks/useAgentChat')
    useAgentChat.mockReturnValueOnce({
      messages: [
        {
          id: '1',
          content: 'This is **bold text** in a message.',
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
    })

    render(<FormattedTextChatInterface {...defaultProps} />)
    
    expect(screen.getByText('bold text')).toBeInTheDocument()
    expect(screen.getByText('bold text')).toHaveClass('font-semibold')
  })
})