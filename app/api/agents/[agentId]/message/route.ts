import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getAgentFromFirebase } from '@/lib/firebase-agents'
import { checkRateLimit } from '@/lib/rate-limit'
import { generateChatResponse, ChatMessage, AgentConfig } from '@/lib/openai'

export async function POST(
  request: Request, 
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
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
    
    // Fetch agent data directly from Firebase
    let agent: any
    try {
      // Try to get agent directly from Firebase first
      agent = await getAgentFromFirebase(agentId)
      
      if (!agent) {
        // Fallback to Mentor backend if Firebase doesn't have the agent
        console.log(`Agent ${agentId} not found in Firebase, trying Mentor backend...`)
        
        const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL || 'http://localhost:8080'
        
        try {
          const curatorResponse = await fetch(`${mentorBackendUrl}/api/curator-data/agents`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token',
            },
            signal: AbortSignal.timeout(3000),
          })

          if (curatorResponse.ok) {
            const curatorData = await curatorResponse.json()
            
            if (curatorData.success && curatorData.agents) {
              // Find the specific agent and convert to keryk format
              const mentorAgent = curatorData.agents.find((a: any) => a.id === agentId)
              if (mentorAgent) {
                agent = {
                  id: mentorAgent.id,
                  name: mentorAgent.name,
                  displayName: mentorAgent.name,
                  description: mentorAgent.description,
                  systemPrompt: mentorAgent.configuration?.systemPrompt || 'Default prompt',
                  model: mentorAgent.configuration?.model || 'gpt-4',
                  temperature: mentorAgent.configuration?.temperature || 0.7,
                  maxTokens: mentorAgent.configuration?.maxTokens || 2000,
                }
              }
            }
          }
        } catch (error) {
          console.log('Mentor backend not available')
        }
      }
      
      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' }, 
          { status: 404 }
        )
      }
    } catch (fetchError) {
      console.error('Error fetching agent:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch agent data' }, 
        { status: 500 }
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
      
      // Log agent info for debugging
      console.log(`Processing message for agent: ${agent.name || agent.displayName}`)
      console.log(`System prompt length: ${agent.systemPrompt?.length || 0} characters`)
      console.log(`Using model: ${agent.model || 'gpt-4o-mini'}`)
      
      // Prepare agent configuration
      const agentConfig: AgentConfig = {
        model: agent.model || 'gpt-4o-mini',
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens || 1000
      }
      
      const aiResponse = await generateChatResponse(
        messages,
        agent.name || agent.displayName,
        agent.description,
        agent.systemPrompt, // Pass the full system prompt
        agentConfig
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
  } catch (error) {
    console.error('Error processing message:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
