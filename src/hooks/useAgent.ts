import { useState, useEffect } from 'react';
import { Agent } from '@/types/agent';
import { 
  getAgents, 
  getAgentById, 
  subscribeToAgents, 
  searchAgents,
  getAgentsByTag 
} from '@/lib/agents';
import { useAuthCheck } from './useAuthCheck';

interface UseAgentsReturn {
  agents: Agent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  searchAgents: (query: string) => Promise<Agent[]>;
  getAgentsByTag: (tag: string) => Promise<Agent[]>;
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuthCheck();

  const userId = user?.uid || null;

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAgents = await getAgents(userId);
      setAgents(fetchedAgents);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAgents();

    // Set up real-time subscription
    const unsubscribe = subscribeToAgents(
      userId,
      (updatedAgents) => {
        setAgents(updatedAgents);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const handleSearchAgents = async (query: string): Promise<Agent[]> => {
    try {
      return await searchAgents(userId, query);
    } catch (err) {
      setError(err as Error);
      return [];
    }
  };

  const handleGetAgentsByTag = async (tag: string): Promise<Agent[]> => {
    try {
      return await getAgentsByTag(userId, tag);
    } catch (err) {
      setError(err as Error);
      return [];
    }
  };

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    searchAgents: handleSearchAgents,
    getAgentsByTag: handleGetAgentsByTag,
  };
}

interface UseAgentReturn {
  agent: Agent | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAgent(agentId: string): UseAgentReturn {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAgent = await getAgentById(agentId);
      setAgent(fetchedAgent);
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