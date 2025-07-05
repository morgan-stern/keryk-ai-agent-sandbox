import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return new Response('OpenAI API key not configured', { status: 503 })
  }

  // Get the upgrade header
  const upgrade = request.headers.get('upgrade')
  
  if (upgrade !== 'websocket') {
    return new Response('Expected WebSocket upgrade', { status: 400 })
  }

  // For now, return instructions on how to set up voice chat
  // In production, you would use a WebSocket server like Socket.io or a proxy
  return new Response(JSON.stringify({
    message: 'Voice chat requires a WebSocket proxy server. For development, the OpenAI API key will be passed from the client.',
    apiKeyConfigured: !!apiKey
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export async function POST(request: NextRequest) {
  // Validate API key exists
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: 'OpenAI API key not configured on server' 
    }), { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // For development, we'll return a temporary token
  // In production, use proper session management
  return new Response(JSON.stringify({
    success: true,
    // Don't send the actual API key to the client
    hasApiKey: true
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}