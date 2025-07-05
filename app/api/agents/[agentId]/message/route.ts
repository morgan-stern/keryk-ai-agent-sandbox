import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getAgentById } from '@/lib/agents-simple'
import { checkRateLimit } from '@/lib/rate-limit'
import { generateChatResponse, ChatMessage } from '@/lib/openai'

export async function POST(
  request: Request, 
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const { message } = await request.json()
    
    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' }, 
        { status: 400 }
      )
    }
    
    // Get auth token from request
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split('Bearer ')[1]
    
    let userId: string | null = null
    let hasAccess = false
    
    // Rate limiting - use IP address for anonymous users, user ID for authenticated
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = token ? `user:${token}` : `ip:${clientIp}`
    const { allowed, remainingRequests } = checkRateLimit(rateLimitKey, 20, 60000) // 20 requests per minute
    
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', remainingRequests }, 
        { status: 429 }
      )
    }
    
    if (token) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        userId = decodedToken.uid
        
        // Check if user has sandbox access
        const userRecord = await adminAuth.getUser(userId)
        hasAccess = userRecord.customClaims?.sandbox_access === true
      } catch {
        // Invalid token, continue as anonymous
      }
    }
    
    // For demo purposes, grant access to all authenticated users
    if (userId && !hasAccess) {
      hasAccess = true
    }
    
    // Check if agent exists and is accessible
    const agent = await getAgentById(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' }, 
        { status: 404 }
      )
    }
    
    // Check access permissions
    if (agent.isTestAgent === false && !userId) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      )
    }
    
    try {
      // Generate response using OpenAI
      const messages: ChatMessage[] = [
        { role: 'user', content: message }
      ]
      
      const aiResponse = await generateChatResponse(
        messages,
        agent.name,
        agent.description
      )
      
      const response = {
        id: Date.now().toString(),
        agentId,
        message: aiResponse,
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous'
      }
      
      return NextResponse.json({ response })
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      
      // Fallback response if OpenAI fails
      const fallbackResponse = {
        id: Date.now().toString(),
        agentId,
        message: `I'm ${agent.name}. I'm having trouble processing your request right now. Please make sure the OpenAI API key is configured and try again.`,
        timestamp: new Date().toISOString(),
        userId: userId || 'anonymous'
      }
      
      return NextResponse.json({ response: fallbackResponse })
    }
  } catch {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
