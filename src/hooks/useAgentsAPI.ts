import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { auth } from '@/lib/firebase';

interface UseAgentsReturn {
  agents: Agent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAgentsAPI(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Next.js API route to proxy the request (avoids CORS issues)
      const response = await fetch('/api/agents');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Convert Mentor agents to our format
      const convertedAgents: Agent[] = (data.agents || []).map((mentorAgent: any) => ({
        id: mentorAgent.id,
        name: mentorAgent.name,
        description: mentorAgent.description || '',
        supportedModes: mentorAgent.supportedModes || ['text', 'voice'],
        tags: mentorAgent.tags || [],
        isTestAgent: true,
        voiceEnabled: mentorAgent.voiceEnabled !== false,
        avatar: mentorAgent.avatar,
        capabilities: mentorAgent.capabilities || [],
        systemPrompt: mentorAgent.systemPrompt, // Add system prompt
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      setAgents(convertedAgents);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents
  };
}