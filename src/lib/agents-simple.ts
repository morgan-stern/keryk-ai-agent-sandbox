// Simple proxy functions for Mentor backend integration

export async function getAgents() {
  const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL;
  if (!mentorBackendUrl) {
    throw new Error('NEXT_PUBLIC_MENTOR_BACKEND_URL is not configured');
  }
  
  const response = await fetch(`${mentorBackendUrl}/api/agents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agents: ${response.statusText}`);
  }
  const data = await response.json();
  return data.agents || [];
}

export async function getAgentById(agentId: string) {
  const mentorBackendUrl = process.env.NEXT_PUBLIC_MENTOR_BACKEND_URL;
  if (!mentorBackendUrl) {
    throw new Error('NEXT_PUBLIC_MENTOR_BACKEND_URL is not configured');
  }
  
  const response = await fetch(`${mentorBackendUrl}/api/agents/${agentId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch agent: ${response.statusText}`);
  }
  return response.json();
}