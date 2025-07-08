import React from 'react'

interface MarkdownFormatterProps {
  content: string
  className?: string
}

export function MarkdownFormatter({ content, className }: MarkdownFormatterProps) {
  // Simple markdown parsing for common elements
  const formatContent = (text: string) => {
    // Split by paragraphs (double newlines)
    const paragraphs = text.split('\n\n')
    
    return paragraphs.map((paragraph, index) => {
      // Check if it's a numbered list
      if (paragraph.match(/^\d+\.\s/)) {
        const listItems = paragraph.split('\n').filter(line => line.trim())
        return (
          <ol key={index} className="list-decimal ml-4 space-y-2 mb-4">
            {listItems.map((item, itemIndex) => {
              const cleanItem = item.replace(/^\d+\.\s/, '')
              return (
                <li key={itemIndex} className="text-sm">
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
          <ul key={index} className="list-disc ml-4 space-y-2 mb-4">
            {listItems.map((item, itemIndex) => {
              const cleanItem = item.replace(/^[-*]\s/, '')
              return (
                <li key={itemIndex} className="text-sm">
                  {formatInlineElements(cleanItem)}
                </li>
              )
            })}
          </ul>
        )
      }
      
      // Regular paragraph
      return (
        <p key={index} className="mb-4 text-sm leading-relaxed">
          {formatInlineElements(paragraph)}
        </p>
      )
    })
  }
  
  // Format inline elements like bold, italic, etc.
  const formatInlineElements = (text: string) => {
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
  
  return (
    <div className={className}>
      {formatContent(content)}
    </div>
  )
}

export default MarkdownFormatter