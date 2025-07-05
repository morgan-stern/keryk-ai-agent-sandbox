import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc,
  doc,
  onSnapshot,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { Agent } from '@/types/agent';

// Helper function to convert Firestore document to Agent type
const docToAgent = (doc: QueryDocumentSnapshot<DocumentData>): Agent => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    supportedModes: data.supportedModes || ['text', 'voice'], // Default to both modes
    tags: data.tags || [],
    isTestAgent: data.isTestAgent || false,
    voiceEnabled: data.voiceEnabled !== undefined 
      ? data.voiceEnabled 
      : true, // Default to voice enabled
    avatar: data.avatar,
    capabilities: data.capabilities || [],
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  };
};

// Get all agents based on user authentication status
export const getAgents = async (userId: string | null): Promise<Agent[]> => {
  try {
    const agentsRef = collection(db, 'agents');
    let q;
    
    if (!userId) {
      // Anonymous users only get test agents
      q = query(
        agentsRef, 
        where('isTestAgent', '==', true)
      );
    } else {
      // Authenticated users get all agents
      q = query(agentsRef);
    }
    
    const snapshot = await getDocs(q);
    const agents = snapshot.docs.map(docToAgent);
    
    // Sort by name in JavaScript
    return agents.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error('Failed to fetch agents');
  }
};

// Get a single agent by ID
export const getAgentById = async (agentId: string): Promise<Agent | null> => {
  try {
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    
    if (!agentDoc.exists()) {
      return null;
    }
    
    return docToAgent(agentDoc as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error('Error fetching agent:', error);
    throw new Error('Failed to fetch agent');
  }
};

// Subscribe to real-time agent updates
export const subscribeToAgents = (
  userId: string | null, 
  callback: (agents: Agent[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  try {
    const agentsRef = collection(db, 'agents');
    let q;
    
    if (!userId) {
      q = query(
        agentsRef, 
        where('isTestAgent', '==', true)
      );
    } else {
      q = query(agentsRef);
    }
    
    return onSnapshot(
      q, 
      (snapshot) => {
        const agents = snapshot.docs.map(docToAgent);
        // Sort by name in JavaScript
        const sortedAgents = agents.sort((a, b) => a.name.localeCompare(b.name));
        callback(sortedAgents);
      },
      (error) => {
        console.error('Error in agent subscription:', error);
        if (onError) {
          onError(error);
        }
      }
    );
  } catch (error) {
    console.error('Error setting up agent subscription:', error);
    if (onError) {
      onError(error as Error);
    }
    // Return a no-op unsubscribe function
    return () => {};
  }
};

// Search agents by name or description
export const searchAgents = async (
  userId: string | null,
  searchQuery: string
): Promise<Agent[]> => {
  try {
    // Get all available agents first
    const agents = await getAgents(userId);
    
    // Filter by search query (case-insensitive)
    const query = searchQuery.toLowerCase();
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.tags.some(tag => tag.toLowerCase().includes(query))
    );
  } catch (error) {
    console.error('Error searching agents:', error);
    throw new Error('Failed to search agents');
  }
};

// Get agents by tag
export const getAgentsByTag = async (
  userId: string | null,
  tag: string
): Promise<Agent[]> => {
  try {
    const agentsRef = collection(db, 'agents');
    let q;
    
    if (!userId) {
      // Anonymous users only get test agents with the tag
      q = query(
        agentsRef,
        where('isTestAgent', '==', true),
        where('tags', 'array-contains', tag)
      );
    } else {
      // Authenticated users get all agents with the tag
      q = query(
        agentsRef,
        where('tags', 'array-contains', tag)
      );
    }
    
    const snapshot = await getDocs(q);
    const agents = snapshot.docs.map(docToAgent);
    
    // Sort by name in JavaScript
    return agents.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching agents by tag:', error);
    throw new Error('Failed to fetch agents by tag');
  }
};