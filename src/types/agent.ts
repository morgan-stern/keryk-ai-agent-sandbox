export interface Agent {
  id: string;
  name: string;
  description: string;
  supportedModes: ('text' | 'voice')[];
  tags: string[];
  isTestAgent: boolean;
  voiceEnabled?: boolean; // Backward compatibility
  avatar?: string;
  capabilities?: string[];
  systemPrompt?: string; // Agent's system prompt
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  mode: 'text' | 'voice';
}

export interface AgentConversation {
  id: string;
  agentId: string;
  userId: string;
  messages: AgentMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}