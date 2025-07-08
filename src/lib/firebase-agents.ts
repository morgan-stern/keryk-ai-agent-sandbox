import { adminDb } from './firebase-admin'

// Interface for StandardizedAgent format from Curator
interface StandardizedAgent {
  id: string
  name: string
  type: string
  description: string
  capabilities: string[]
  specialization: string[]
  configuration: {
    model: string
    temperature: number
    maxTokens: number
    systemPrompt: string
    responseFormat?: any
  }
  tools: any[]
  metadata: {
    companyId: string
    enabled: boolean
    owner: string
    rating?: number
    tags?: string[]
    createdAt?: string
    updatedAt?: string
  }
}

// Interface for keryk_sandbox agent format
export interface KerykAgent {
  id: string
  name: string
  displayName: string
  description: string
  avatar: string
  capabilities: string[]
  specialization: string[]
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  isActive: boolean
  metadata: {
    companyId: string
    createdBy: string
    successRate: number
    responseTime: number
    rating: number
    tools: string[]
    tags: string[]
  }
  createdAt: string
  updatedAt: string
}

// Fetch agents directly from Firebase
export async function getAgentsFromFirebase(): Promise<KerykAgent[]> {
  try {
    console.log('Fetching agents directly from Firebase...')
    
    // Get all agents from the standardizedAgents collection
    const agentsSnapshot = await adminDb.collection('standardizedAgents').get()
    
    if (agentsSnapshot.empty) {
      console.log('No agents found in Firebase')
      return []
    }
    
    const agents: KerykAgent[] = []
    
    agentsSnapshot.forEach((doc) => {
      const agent = doc.data() as StandardizedAgent
      
      // Convert StandardizedAgent format to KerykAgent format
      const kerykAgent: KerykAgent = {
        id: doc.id,
        name: agent.name,
        displayName: agent.name,
        description: agent.description,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${doc.id}`,
        capabilities: agent.capabilities || ['text-generation', 'knowledge-retrieval'],
        specialization: agent.specialization || [],
        model: agent.configuration?.model || 'gpt-4',
        temperature: agent.configuration?.temperature || 0.7,
        maxTokens: agent.configuration?.maxTokens || 2000,
        systemPrompt: agent.configuration?.systemPrompt || 'Default prompt',
        isActive: agent.metadata?.enabled !== false,
        metadata: {
          companyId: agent.metadata?.companyId || 'x2pD8XtnLlbum9lx2w6x',
          createdBy: agent.metadata?.owner || 'dev-super-admin',
          successRate: 0.95,
          responseTime: 1200,
          rating: agent.metadata?.rating || 4.5,
          tools: agent.tools?.map((t: any) => t.id || t.name) || [],
          tags: agent.metadata?.tags || []
        },
        createdAt: agent.metadata?.createdAt || new Date().toISOString(),
        updatedAt: agent.metadata?.updatedAt || new Date().toISOString()
      }
      
      agents.push(kerykAgent)
    })
    
    console.log(`Successfully fetched ${agents.length} agents from Firebase`)
    return agents
  } catch (error) {
    console.error('Error fetching agents from Firebase:', error)
    throw error
  }
}

// Get a single agent by ID
export async function getAgentFromFirebase(agentId: string): Promise<KerykAgent | null> {
  try {
    console.log(`Fetching agent ${agentId} from Firebase...`)
    
    const agentDoc = await adminDb.collection('standardizedAgents').doc(agentId).get()
    
    if (!agentDoc.exists) {
      console.log(`Agent ${agentId} not found in Firebase`)
      return null
    }
    
    const agent = agentDoc.data() as StandardizedAgent
    
    // Convert to KerykAgent format
    const kerykAgent: KerykAgent = {
      id: agentDoc.id,
      name: agent.name,
      displayName: agent.name,
      description: agent.description,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${agentDoc.id}`,
      capabilities: agent.capabilities || ['text-generation', 'knowledge-retrieval'],
      specialization: agent.specialization || [],
      model: agent.configuration?.model || 'gpt-4',
      temperature: agent.configuration?.temperature || 0.7,
      maxTokens: agent.configuration?.maxTokens || 2000,
      systemPrompt: agent.configuration?.systemPrompt || 'Default prompt',
      isActive: agent.metadata?.enabled !== false,
      metadata: {
        companyId: agent.metadata?.companyId || 'x2pD8XtnLlbum9lx2w6x',
        createdBy: agent.metadata?.owner || 'dev-super-admin',
        successRate: 0.95,
        responseTime: 1200,
        rating: agent.metadata?.rating || 4.5,
        tools: agent.tools?.map((t: any) => t.id || t.name) || [],
        tags: agent.metadata?.tags || []
      },
      createdAt: agent.metadata?.createdAt || new Date().toISOString(),
      updatedAt: agent.metadata?.updatedAt || new Date().toISOString()
    }
    
    console.log(`Successfully fetched agent ${agentId} from Firebase`)
    console.log(`System prompt length: ${kerykAgent.systemPrompt.length} characters`)
    
    return kerykAgent
  } catch (error) {
    console.error(`Error fetching agent ${agentId} from Firebase:`, error)
    throw error
  }
}