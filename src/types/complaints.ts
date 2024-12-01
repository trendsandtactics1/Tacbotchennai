export interface Message {
  id: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
  complaint_session_id?: string;
  session_id?: string;
  user_id?: string;
  agent_id?: string;
}

export interface Complaint {
  id: string;
  message?: string;
  user_message: string;
  admin_reply: string[] | null;
  status: string;
  created_at: string;
  agent_id: string | null;
  session_id: string;
  parent_id: string | null;
  is_reply: boolean;
  updated_at: string;
  parent_complaint_id: string | null;
  agent: Agent | null;
  replies?: number;
  conversation?: Message[];
  reply_timestamps?: string[];
}

export interface Conversation {
  id: string;
  message: string;
  timestamp: string;
  status: string;
  agent?: {
    name: string;
    status: string;
  };
  session_id: string;
  sender: string;
  is_agent_conversation?: boolean;
}

export interface ComplaintSession {
  id: string;
  user_id: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    mobile: string;
  };
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  created_at: string;
}

export interface ComplaintMessage {
  id: string;
  complaint_session_id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

// Helper function to ensure sender is of correct type
export function normalizeSender(sender: string): 'user' | 'agent' {
  return sender === 'agent' ? 'agent' : 'user';
}