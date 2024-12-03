export interface RecentChat {
  id: string;
  created_at: string;
  users: {
    name: string;
  };
}

export interface RecentEnquiry {
  id: string;
  subject: string;
  status: 'pending' | 'active' | 'closed';
  created_at: string;
  users: {
    name: string;
  };
}

export interface RecentActivity {
  recentChats: RecentChat[];
  recentEnquiries: RecentEnquiry[];
}

// Raw types for Supabase responses
export interface RawChat {
  id: string;
  created_at: string;
  users: Array<{ name: string }>;
}

export interface RawEnquiry {
  id: string;
  subject: string;
  status: 'pending' | 'active' | 'closed';
  created_at: string;
  users: Array<{ name: string }>;
}

export interface Conversation {
  id: string;
  users: {
    name: string;
  };
  lastMessage?: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}
