export type AgentStatus = 'online' | 'offline' | 'busy';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  role?: string;
  is_admin: boolean;
  avatar_url?: string;
}

export interface AgentWithStats extends Agent {
  activeChats?: number;
  resolvedChats?: number;
  averageResponseTime?: number;
} 