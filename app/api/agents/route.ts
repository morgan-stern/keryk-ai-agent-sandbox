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
    },
    {
      id: "QUpoTuEAPIW3UwPYUhCL",
      name: "Adders Expert",
      displayName: "Adders Expert",
      description: "Specialized agent for advanced mathematical calculations and problem solving",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=QUpoTuEAPIW3UwPYUhCL",
      capabilities: ["text-generation", "mathematical-computation"],
      specialization: ["mathematics", "calculations"],
      model: "gpt-4",
      temperature: 0.2,
      maxTokens: 2000,
      systemPrompt: "You are an expert mathematician specializing in complex calculations and problem solving.",
      isActive: true,
      metadata: {
        companyId: "x2pD8XtnLlbum9lx2w6x",
        createdBy: "dev-super-admin",
        successRate: 0.95,
        responseTime: 1000,
        rating: 4.6,
        tools: ["precisionCalculator"],
        tags: ["mathematics", "calculations"]
      },
      createdAt: "2025-07-07T16:00:00.000Z",
      updatedAt: "2025-07-07T16:00:00.000Z"
    },
    {
      id: "vHJXJ3Al3DzCZIcuDpCN",
      name: "Duke Rules Agent",
      displayName: "Duke Rules Agent",
      description: "Expert agent for Duke University rules, regulations, and policy guidance",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=vHJXJ3Al3DzCZIcuDpCN",
      capabilities: ["text-generation", "knowledge-retrieval"],
      specialization: ["academic-policy", "university-rules"],
      model: "gpt-4",
      temperature: 0.3,
      maxTokens: 3000,
      systemPrompt: "You are an expert on Duke University rules, regulations, and academic policies.",
      isActive: true,
      metadata: {
        companyId: "x2pD8XtnLlbum9lx2w6x",
        createdBy: "dev-super-admin",
        successRate: 0.94,
        responseTime: 1300,
        rating: 4.4,
        tools: [],
        tags: ["academic-policy", "university-rules"]
      },
      createdAt: "2025-07-07T16:00:00.000Z",
      updatedAt: "2025-07-07T16:00:00.000Z"
    },
    {
      id: "7z8FoYePrRzI5MCD7YOw",
      name: "Lumos Validation Expert",
      displayName: "Lumos Validation Expert", 
      description: "Specialized agent for data validation and quality assurance using Lumos framework",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=7z8FoYePrRzI5MCD7YOw",
      capabilities: ["text-generation", "data-validation"],
      specialization: ["data-quality", "validation"],
      model: "gpt-4",
      temperature: 0.1,
      maxTokens: 2500,
      systemPrompt: `## Role Definition

You are an expert invoice validation specialist for Lumos Fiber construction projects. Your role is to validate contractor invoices for fiber optic installation work, ensuring work was performed in authorized zones, workers comply with hour limits, billing rates match contracts, and all supporting documentation aligns. You prevent overpayment while maintaining fair contractor relationships through accurate, consistent validation.

## Core Knowledge Base

### 1. Invoice Components and Structure

#### Standard Invoice Sections

\`\`\`
1. Header Information
   - Invoice number (required)
   - Invoice date
   - Contractor information
   - Project reference

2. Work Location Sections
   - Polygon reference (e.g., "VA Beach Remote 32 LCP 1 CAB-1")
   - Physical address
   - Work dates
   - Section subtotals

3. Line Items per Section
   - Worker entries (name, hours, dates)
   - Equipment charges
   - Materials (if any)
   - Daily/hourly breakdowns

4. Summary
   - Section totals
   - Invoice total
   - Payment terms
\`\`\`

[Rest of the full prompt would continue here...]`,
      isActive: true,
      metadata: {
        companyId: "x2pD8XtnLlbum9lx2w6x",
        createdBy: "dev-super-admin",
        successRate: 0.97,
        responseTime: 1100,
        rating: 4.7,
        tools: [],
        tags: ["data-quality", "validation"]
      },
      createdAt: "2025-07-07T16:00:00.000Z",
      updatedAt: "2025-07-07T16:00:00.000Z"
    }
  ],
  count: 5
}

export async function GET(request: Request) {
  try {
    // Try to proxy to Mentor backend first
    const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL || 'http://localhost:8080'
    
    try {
      // First try to get agents from Curator via Mentor's curator-data endpoint
      const curatorResponse = await fetch(`${mentorBackendUrl}/api/curator-data/agents`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token', // Dev auth
        },
        // Add a timeout
        signal: AbortSignal.timeout(3000),
      })

      if (curatorResponse.ok) {
        const curatorData = await curatorResponse.json()
        
        // Convert StandardizedAgent format to match keryk_sandbox format
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
            source: 'curator'
          })
        }
      }
    } catch (error) {
      console.log('Curator data not available, trying regular agents endpoint')
      
      // Fallback to regular agents endpoint
      try {
        const response = await fetch(`${mentorBackendUrl}/api/agents`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
          signal: AbortSignal.timeout(3000),
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json(data)
        }
      } catch (error) {
        console.log('Mentor backend not available, using mock agents')
      }
    }
    
    // Return mock agents if Mentor backend is not available
    return NextResponse.json(mockAgents)
  } catch (error) {
    console.error('Error in agents API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents', details: (error as Error).message }, 
      { status: 500 }
    )
  }
}
