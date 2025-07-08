import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { EnhancedTextChat } from '../EnhancedTextChat'

describe('EnhancedTextChat', () => {
  const mockMessages = [
    {
      id: '1',
      content: 'Hello world',
      role: 'user' as const,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      content: 'Hello! How can I help you today?',
      role: 'assistant' as const,
      timestamp: new Date().toISOString()
    }
  ]

  it('renders messages correctly', () => {
    render(<EnhancedTextChat messages={mockMessages} isTyping={false} />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument()
  })

  it('shows typing indicator when isTyping is true', () => {
    render(<EnhancedTextChat messages={mockMessages} isTyping={true} />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(document.querySelector('.typing-dot')).toBeInTheDocument()
  })

  it('formats numbered lists correctly', () => {
    const messagesWithList = [
      {
        id: '1',
        content: '1. First item\n2. Second item\n3. Third item',
        role: 'assistant' as const,
        timestamp: new Date().toISOString()
      }
    ]
    
    render(<EnhancedTextChat messages={messagesWithList} isTyping={false} />)
    
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
    expect(screen.getByText('Third item')).toBeInTheDocument()
  })

  it('formats bold text correctly', () => {
    const messagesWithBold = [
      {
        id: '1',
        content: 'This is **bold text** and this is normal.',
        role: 'assistant' as const,
        timestamp: new Date().toISOString()
      }
    ]
    
    render(<EnhancedTextChat messages={messagesWithBold} isTyping={false} />)
    
    expect(screen.getByText('bold text')).toBeInTheDocument()
    expect(screen.getByText('bold text')).toHaveClass('font-semibold')
  })
})