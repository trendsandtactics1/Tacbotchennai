export interface User {
  id: string;
  name: string;
  mobile: string;
  created_at: string;
}

export interface ChatUser extends User {
  // Additional chat-specific user properties if needed
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  last_message?: string;
  user?: User;
} 