export interface Conversation {
  id: string;
  message: string;
  timestamp: string;
  status: string;
  session_id: string;
  sender: string;
  agent_id?: string;
  agent?: {
    name: string;
    status: string;
  };
} 