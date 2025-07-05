import { api } from './api'

export interface AgentResponse {
  message: string
  timestamp: string
  metadata?: {
    confidence?: number
    sources?: string[]
    [key: string]: any
  }
}

export interface AgentSession {
  sessionId: string
  agentId: string
  startedAt: string
  lastMessageAt?: string
  messageCount: number
}

class AgentService {
  private sessions: Map<string, AgentSession> = new Map()

  /**
   * Create a new chat session with an agent
   */
  async createSession(agentId: string): Promise<AgentSession> {
    const session: AgentSession = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      startedAt: new Date().toISOString(),
      messageCount: 0
    }
    
    this.sessions.set(session.sessionId, session)
    return session
  }

  /**
   * Send a message to an agent and get a response
   */
  async sendMessage(
    agentId: string, 
    message: string,
    sessionId?: string
  ): Promise<AgentResponse> {
    try {
      const { data, error } = await api.agents.sendMessage(agentId, message)
      
      if (error) {
        throw new Error(error)
      }
      
      if (!data?.response) {
        throw new Error('No response received from agent')
      }

      // Update session if provided
      if (sessionId && this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!
        session.lastMessageAt = new Date().toISOString()
        session.messageCount += 2 // User message + agent response
      }
      
      return {
        message: data.response.message || data.response,
        timestamp: data.response.timestamp || new Date().toISOString(),
        metadata: data.response.metadata
      }
    } catch (error) {
      console.error('AgentService.sendMessage error:', error)
      throw error
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * End a chat session
   */
  endSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  /**
   * Get all active sessions for an agent
   */
  getAgentSessions(agentId: string): AgentSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.agentId === agentId
    )
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions.clear()
  }
}

// Export singleton instance
export const agentService = new AgentService()