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

export interface AdminEnquiry {
  id: string;
  subject: string;
  status: 'pending' | 'active' | 'resolved';
  created_at: string;
  updated_at: string;
  users: {
    name: string;
    mobile: string;
  };
  messages: EnquiryMessage[];
}

export interface EnquiryMessage {
  id: string;
  enquiry_id: string;
  content: string;
  sender_type: 'user' | 'admin';
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementData {
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url?: string;
  youtube_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
}
