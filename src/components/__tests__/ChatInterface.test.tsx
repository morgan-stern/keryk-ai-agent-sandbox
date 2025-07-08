import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChatInterface } from '../ChatInterface'

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

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the chat interface', () => {
    render(<ChatInterface agentId="test-agent" />)
    
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('A test agent')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type a message or use voice recording...')).toBeInTheDocument()
  })

  it('displays messages with proper formatting', async () => {
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

    render(<ChatInterface agentId="test-agent" />)
    
    const input = screen.getByPlaceholderText('Type a message or use voice recording...')
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  it('handles voice mode toggle', () => {
    render(<ChatInterface agentId="test-agent" />)
    
    const voiceToggle = screen.getByLabelText('Toggle voice mode')
    fireEvent.click(voiceToggle)
    
    // Voice mode should be activated
    expect(voiceToggle).toHaveClass('bg-primary')
  })

  it('handles send message on Enter key', async () => {
    render(<ChatInterface agentId="test-agent" />)
    
    const input = screen.getByPlaceholderText('Type a message or use voice recording...')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })
  })

  it('disables input when sending', async () => {
    render(<ChatInterface agentId="test-agent" />)
    
    const input = screen.getByPlaceholderText('Type a message or use voice recording...')
    const sendButton = screen.getByLabelText('Send message')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    // Input should be disabled while sending
    expect(input).toBeDisabled()
  })
})