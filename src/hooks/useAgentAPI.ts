import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';

interface UseAgentReturn {
  agent: Agent | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAgentAPI(agentId: string): UseAgentReturn {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Next.js API route to proxy the request (avoids CORS issues)
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Find the specific agent
      const mentorAgent = (data.agents || []).find((agent: any) => agent.id === agentId);
      
      if (!mentorAgent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      // Convert Mentor agent to our format
      const convertedAgent: Agent = {
        id: mentorAgent.id,
        name: mentorAgent.name,
        description: mentorAgent.description || '',
        supportedModes: mentorAgent.supportedModes || ['text', 'voice'],
        tags: mentorAgent.tags || [],
        isTestAgent: true,
        voiceEnabled: mentorAgent.voiceEnabled !== false,
        avatar: mentorAgent.avatar,
        capabilities: mentorAgent.capabilities || [],
        createdAt: mentorAgent.createdAt || new Date().toISOString(),
        updatedAt: mentorAgent.updatedAt || new Date().toISOString()
      };
      
      setAgent(convertedAgent);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching agent:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchAgent();
    }
  }, [agentId]);

  return {
    agent,
    loading,
    error,
    refetch: fetchAgent,
  };
}