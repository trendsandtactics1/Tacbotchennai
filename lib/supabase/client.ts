import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mobile: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_histories: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          content: string;
          role: 'user' | 'assistant';
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          content: string;
          role: 'user' | 'assistant';
          created_at?: string;
        };
      };
      enquiries: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          status: 'pending' | 'active' | 'resolved';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          status?: 'pending' | 'active' | 'resolved';
          created_at?: string;
          updated_at?: string;
        };
      };
      enquiry_messages: {
        Row: {
          id: string;
          enquiry_id: string;
          content: string;
          sender_type: 'user' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          content: string;
          sender_type: 'user' | 'admin';
          created_at?: string;
        };
      };
    };
  };
};
