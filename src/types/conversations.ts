export type ConversationStatus = 'pending' | 'resolved' | 'closed';

export interface Conversation {
  id: string;
  session_id: string;
  sender: 'user' | 'agent' | 'system';
  message: string;
  timestamp: string;
  status: ConversationStatus;
  agent_id?: string;
  is_agent_conversation: boolean;
  user_id?: string;
  chat_session_id?: string;
  complaint_session_id?: string;
}

export interface ConversationWithRelations extends Conversation {
  agent?: {
    id: string;
    name: string;
    status: string;
  };
  user?: {
    id: string;
    name: string;
    mobile: string;
  };
} 