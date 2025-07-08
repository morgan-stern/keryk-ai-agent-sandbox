import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EnhancedChatInterface } from '../EnhancedChatInterface'

// Mock the hooks
jest.mock('@/hooks/useAgentAPI', () => ({
  useAgentAPI: jest.fn(() => ({
    agent: {
      id: 'test-agent',
      name: 'Test Agent',
      description: 'A test agent',
      supportedModes: ['text', 'voice'],
      avatar: 'test-avatar.png',
      isTestAgent: true
    },
    loading: false,
    error: null
  }))
}))

jest.mock('@/hooks/useAuthCheck', () => ({
  useAuthCheck: jest.fn(() => ({
    user: { isAnonymous: false }
  }))
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

jest.mock('@/services/api', () => ({
  api: {
    agents: {
      sendMessage: jest.fn(() => Promise.resolve({
        data: {
          response: {
            message: 'Test response',
            timestamp: new Date().toISOString()
          }
        },
        error: null
      }))
    }
  }
}))

describe('EnhancedChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the enhanced chat interface', () => {
    render(<EnhancedChatInterface agentId="test-agent" />)
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('A test agent')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a message or use voice recording...')).toBeInTheDocument()
  })

  it('formats agent messages with numbered lists', async () => {
    const { api } = require('@/services/api')
    api.agents.sendMessage.mockResolvedValueOnce({
      data: {
        response: {
          message: '1. **First item**: This is the first item\n2. **Second item**: This is the second item',
          timestamp: new Date().toISOString()
        }
      },
      error: null
    })

    render(<EnhancedChatInterface agentId="test-agent" />)
    
    const input = screen.getByPlaceholderText('Type a message or use voice recording...')
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
    })
  })

  it('formats bold text correctly', async () => {
    const { api } = require('@/services/api')
    api.agents.sendMessage.mockResolvedValueOnce({
      data: {
        response: {
          message: 'This is **bold text** in a response.',
          timestamp: new Date().toISOString()
        }
      },
      error: null
    })

    render(<EnhancedChatInterface agentId="test-agent" />)
    
    const input = screen.getByPlaceholderText('Type a message or use voice recording...')
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('bold text')).toBeInTheDocument()
    })
  })
})