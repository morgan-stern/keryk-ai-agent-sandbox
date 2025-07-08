import { NextResponse } from 'next/server'
import { getAgentsFromFirebase } from '@/lib/firebase-agents'

export async function GET(request: Request) {
  try {
    // Try to get agents directly from Firebase
    try {
      const agents = await getAgentsFromFirebase()
      
      if (agents.length > 0) {
        console.log(`✅ Successfully loaded ${agents.length} agents directly from Firebase`)
        return NextResponse.json({
          success: true,
          agents: agents,
          count: agents.length,
          source: 'firebase-direct'
        })
      } else {
        console.log('No agents found in Firebase')
      }
    } catch (firebaseError) {
      console.error('Error fetching from Firebase:', firebaseError)
      
      // Fallback to Mentor backend if Firebase fails
      const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL || 'http://localhost:8080'
      
      try {
        // Try to get agents from Curator via Mentor's curator-data endpoint
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
            const convertedAgents = curatorData.agents.map((agent: any) => ({
              id: agent.id,
              name: agent.name,
              displayName: agent.name,
              description: agent.description,
              avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.id}`,
              capabilities: agent.capabilities || ["text-generation", "knowledge-retrieval"],
              specialization: agent.specialization || [],
              model: agent.configuration?.model || 'gpt-4',
              temperature: agent.configuration?.temperature || 0.7,
              maxTokens: agent.configuration?.maxTokens || 2000,
              systemPrompt: agent.configuration?.systemPrompt || 'Default prompt',
              isActive: agent.metadata?.enabled !== false,
              metadata: {
                companyId: agent.metadata?.companyId || "x2pD8XtnLlbum9lx2w6x",
                createdBy: agent.metadata?.owner || "dev-super-admin",
                successRate: 0.95,
                responseTime: 1200,
                rating: 4.5,
                tools: agent.tools?.map((t: any) => t.id || t.name) || [],
                tags: agent.metadata?.tags || []
              },
              createdAt: agent.metadata?.createdAt || new Date().toISOString(),
              updatedAt: agent.metadata?.updatedAt || new Date().toISOString()
            }))
            
            return NextResponse.json({
              success: true,
              agents: convertedAgents,
              count: convertedAgents.length,
              source: 'mentor-backend'
            })
          }
        }
      } catch (error) {
        console.log('Mentor backend not available')
      }
    }
    
    // Return empty array if all sources fail
    console.log('⚠️  No agent sources available');
    return NextResponse.json({
      success: true,
      agents: [],
      count: 0,
      warning: 'No agents available - Check Firebase configuration or Mentor backend'
    })
  } catch (error) {
    console.error('Error in agents API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: (error as Error).message }, 
      { status: 500 }
    )
  }
}
