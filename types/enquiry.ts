export interface Enquiry {
  id: string;
  user_id: string;
  subject: string;
  status: 'pending' | 'active' | 'closed';
  created_at: string;
  lastMessage?: EnquiryMessage;
}

export interface EnquiryMessage {
  id: string;
  enquiry_id: string;
  content: string;
  role: 'user' | 'admin';
  created_at: string;
}

export type ViewType = 'welcome' | 'registration' | 'list' | 'new' | 'chat';

export interface UserDetails {
  id: string;
  name: string;
  mobile: string;
}
