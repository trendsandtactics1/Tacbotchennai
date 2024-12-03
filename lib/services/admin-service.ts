import { supabase } from '../supabase/client';
import type {
  Conversation,
  Message,
  RecentActivity,
  RecentChat,
  RecentEnquiry
} from '@/types/admin';

export class AdminService {
  static async getDashboardStats() {
    try {
      // Get total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Get total chats
      const { count: totalChats, error: chatsError } = await supabase
        .from('chat_histories')
        .select('*', { count: 'exact', head: true });

      if (chatsError) throw chatsError;

      // Get total enquiries
      const { count: totalEnquiries, error: enquiriesError } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true });

      if (enquiriesError) throw enquiriesError;

      // Get active enquiries
      const { count: activeEnquiries, error: activeEnquiriesError } =
        await supabase
          .from('enquiries')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending', 'active']);

      if (activeEnquiriesError) throw activeEnquiriesError;

      return {
        totalUsers: totalUsers ?? 0,
        totalChats: totalChats ?? 0,
        totalEnquiries: totalEnquiries ?? 0,
        activeEnquiries: activeEnquiries ?? 0,
        todayChats: 0,
        todayEnquiries: 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  static async getRecentActivity(): Promise<RecentActivity> {
    try {
      // Get recent chats with user information
      const { data: chats, error: chatsError } = await supabase
        .from('chat_histories')
        .select(
          `
          id,
          created_at,
          user_id,
          users!chat_histories_user_id_fkey (
            name
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(5);

      if (chatsError) throw chatsError;

      // Get recent enquiries with user information
      const { data: enquiries, error: enquiriesError } = await supabase
        .from('enquiries')
        .select(
          `
          id,
          subject,
          status,
          created_at,
          user_id,
          users!enquiries_user_id_fkey (
            name
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(5);

      if (enquiriesError) throw enquiriesError;

      // Transform the data to match our expected types
      const recentChats: RecentChat[] = (chats || []).map((chat) => ({
        id: chat.id,
        created_at: chat.created_at,
        users: {
          name: chat.users?.[0]?.name || 'Unknown User'
        }
      }));

      const recentEnquiries: RecentEnquiry[] = (enquiries || []).map(
        (enquiry) => ({
          id: enquiry.id,
          subject: enquiry.subject,
          status: enquiry.status,
          created_at: enquiry.created_at,
          users: {
            name: enquiry.users?.[0]?.name || 'Unknown User'
          }
        })
      );

      return {
        recentChats,
        recentEnquiries
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  static async getConversations(): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_histories')
        .select(
          `
          id,
          updated_at,
          users!inner (
            name
          ),
          messages (
            content,
            created_at
          )
        `
        )
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((chat) => ({
        id: chat.id,
        users: {
          name: chat.users?.[0]?.name || 'Unknown User'
        },
        lastMessage: chat.messages[0]?.content,
        updated_at: chat.updated_at
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  static async getConversationMessages(chatId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
}
