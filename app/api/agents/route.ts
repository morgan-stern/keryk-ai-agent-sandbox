import { NextResponse } from 'next/server'

// Mock agents for development
const mockAgents = {
  success: true,
  agents: [
    {
      id: "05B4PTRBlK9R8gi5fgyj",
      name: "Test Knowledge Assistant",
      displayName: "Test Knowledge Assistant",
      description: "A test agent to verify the StandardizedAgent format is working correctly",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=05B4PTRBlK9R8gi5fgyj",
      capabilities: ["text-generation", "knowledge-retrieval"],
      specialization: ["test", "demo", "knowledge-base"],
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: "You are a helpful test assistant designed to verify that the agent system is working correctly.",
      isActive: true,
      metadata: {
        companyId: "x2pD8XtnLlbum9lx2w6x",
        createdBy: "dev-super-admin",
        successRate: 0.95,
        responseTime: 1200,
        rating: 4.5,
        tools: [],
        tags: ["test", "demo", "knowledge-base"]
      },
      createdAt: "2025-07-05T21:14:58.210Z",
      updatedAt: "2025-06-30T19:54:20.842Z"
    },
    {
      id: "mIEJLioAisGxpNenShWr",
      name: "MUTCD_TA_Specialist",
      displayName: "MUTCD TA Specialist",
      description: "Expert agent for MUTCD Typical Applications with comprehensive embedded knowledge",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mIEJLioAisGxpNenShWr",
      capabilities: ["text-generation", "knowledge-retrieval"],
      specialization: [],
      model: "gpt-4",
      temperature: 0.3,
      maxTokens: 4000,
      systemPrompt: "You are a MUTCD Typical Applications specialist with comprehensive embedded knowledge.",
      isActive: true,
      metadata: {
        companyId: "x2pD8XtnLlbum9lx2w6x",
        createdBy: "dev-super-admin",
        successRate: 0.95,
        responseTime: 1200,
        rating: 4.5,
        tools: ["precisionCalculator"],
        tags: []
      },
      createdAt: "2025-07-05T21:14:58.210Z",
      updatedAt: "2025-07-05T19:07:58.431Z"
    }
  ],
  count: 2
}

export async function GET(request: Request) {
  try {
    // Try to proxy to Mentor backend first
    const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL || 'http://localhost:8080'
    
    try {
      const response = await fetch(`${mentorBackendUrl}/api/agents`, {
        headers: {
          'Content-Type': 'application/json',
        },
        // Add a timeout
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (error) {
      console.log('Mentor backend not available, using mock agents')
    }
    
    // Return mock agents if Mentor backend is not available
    return NextResponse.json(mockAgents)
  } catch (error) {
    console.error('Error in agents API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: error.message }, 
      { status: 500 }
    )
  }
}
