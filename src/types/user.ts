export interface ChatUser {
  id: string;
  mobile: string;
  name: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  last_message?: string;
} 