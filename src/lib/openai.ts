import OpenAI from 'openai'

// Initialize OpenAI client - will use OPENAI_API_KEY from environment
let openaiClient: OpenAI | null = null

export function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function generateChatResponse(
  messages: ChatMessage[],
  agentName: string,
  agentDescription?: string,
  model: string = 'gpt-4o-mini'
) {
  const client = getOpenAIClient()
  
  if (!client) {
    throw new Error('OpenAI API key not configured')
  }

  // Prepare system message based on agent info
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are ${agentName}. ${agentDescription || ''} Be helpful, concise, and friendly in your responses.`
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate response')
  }
}

// For voice chat - validate API key exists
export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY
}

// Get WebSocket URL for Realtime API
export function getRealtimeWebSocketUrl(): string {
  return 'wss://api.openai.com/v1/realtime'
}