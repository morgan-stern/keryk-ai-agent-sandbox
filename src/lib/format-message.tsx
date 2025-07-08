import React from 'react'

export function formatMessage(content: string): JSX.Element {
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