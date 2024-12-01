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

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ReplyStatus = 'none' | 'pending' | 'answered';

export interface Complaint {
  id: string;
  user_id: string;
  agent_id?: string;
  session_id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  user_message?: string;
  category?: string;
  priority: ComplaintPriority;
  admin_reply?: string;
  admin_reply_at?: string;
  admin_user_id?: string;
  is_reply: boolean;
  parent_id?: string;
  reply_count: number;
  reply_timestamps?: string[];
  last_reply_at?: string;
  reply_status: ReplyStatus;
  has_unread_reply: boolean;
}

export interface ComplaintReply {
  id: string;
  complaint_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  user?: {
    name: string;
    mobile: string;
  };
}

export interface ComplaintWithRelations extends Complaint {
  user?: {
    id: string;
    name: string;
    mobile: string;
  };
  agent?: {
    id: string;
    name: string;
    status: string;
  };
  admin_user?: {
    id: string;
    name: string;
  };
  replies?: ComplaintReply[];
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
  agent_id?: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    mobile: string;
  };
  agent?: {
    name: string;
    status: string;
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