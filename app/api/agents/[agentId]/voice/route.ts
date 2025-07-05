import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getAgentById } from '@/lib/agents-simple'

export async function GET(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    
    // Get auth token from request
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split('Bearer ')[1]
    
    let userId: string | null = null
    
    if (token) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        userId = decodedToken.uid
      } catch {
        // Invalid token
      }
    }
    
    // Check if agent exists
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
    
    // Check if Mentor backend is configured
    const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL || 'http://localhost:8080'
    
    try {
      // Create OpenAI Realtime session via Mentor backend
      const response = await fetch(`${mentorBackendUrl}/api/realtime/openai/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward auth token if available
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          model: 'gpt-4o-realtime-mini',
          modalities: ['text', 'audio']
        })
      })
      
      if (!response.ok) {
        // Fallback message if Mentor backend is not available
        return NextResponse.json(
          { 
            error: 'Voice chat requires Mentor backend. Start it with: cd /Users/morganstern/mentor && npm run dev:backend',
            mentorBackendUrl 
          },
          { status: 503 }
        )
      }
      
      const sessionData = await response.json()
      
      // Return the session details with WebSocket URL
      return NextResponse.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          voiceEnabled: agent.voiceEnabled
        },
        session: sessionData,
        websocketUrl: mentorBackendUrl.replace('http://', 'ws://').replace('https://', 'wss://')
      })
    } catch {
      console.error('Failed to create realtime session')
      return NextResponse.json(
        { 
          error: 'Failed to create voice session. Ensure Mentor backend is running.',
          details: 'Check Mentor backend logs for more information'
        },
        { status: 503 }
      )
    }
  } catch {
    console.error('Error in voice route')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
export async function POST(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params
    const body = await request.json()
    
    // Get auth token from request
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split('Bearer ')[1]
    
    // Check if agent exists
    const agent = await getAgentById(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Use Mentor backend to create realtime session
    const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL || 'http://localhost:8080'
    
    const response = await fetch(`${mentorBackendUrl}/api/realtime/openai/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        model: body.model || 'gpt-4o-realtime-mini',
        modalities: body.modalities || ['text', 'audio'],
        instructions: `You are ${agent.name}. ${agent.description} Be helpful, concise, and friendly in your responses.`
      })
    })
    
    if (!response.ok) {
      throw new Error(`Mentor backend returned ${response.status}`)
    }
    
    const sessionData = await response.json()
    
    return NextResponse.json({
      success: true,
      ...sessionData,
      websocketUrl: mentorBackendUrl.replace('http://', 'ws://').replace('https://', 'wss://')
    })
  } catch {
    console.error('Error creating voice session')
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    )
  }
}
