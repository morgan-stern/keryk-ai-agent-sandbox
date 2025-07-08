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

export interface AgentConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function generateChatResponse(
  messages: ChatMessage[],
  agentName: string,
  agentDescription?: string,
  systemPrompt?: string,
  config?: AgentConfig
) {
  const client = getOpenAIClient()
  
  if (!client) {
    throw new Error('OpenAI API key not configured')
  }

  // Use provided system prompt or fall back to basic description
  const systemMessage: ChatMessage = {
    role: 'system',
    content: systemPrompt || `You are ${agentName}. ${agentDescription || ''} Be helpful, concise, and friendly in your responses.`
  }

  try {
    // Ensure temperature is a valid number between 0 and 2
    const temperature = typeof config?.temperature === 'number' 
      ? Math.min(Math.max(config.temperature, 0), 2) 
      : 0.7;
    
    // Fix common model name issues
    let modelName = config?.model || 'gpt-4o-mini';
    if (modelName.includes('o4-mini')) {
      modelName = 'gpt-4o-mini';
    }
    
    console.log(`Using OpenAI model: ${modelName}, temperature: ${temperature}`);
    
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [systemMessage, ...messages],
      temperature: temperature,
      max_completion_tokens: config?.maxTokens || 1000, // Using new parameter name for newer models
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