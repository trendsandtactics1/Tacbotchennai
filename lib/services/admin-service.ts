import { supabase } from '../supabase/client';
import type {
  Conversation,
  Message,
  RecentActivity,
  RecentChat,
  RecentEnquiry,
  AdminEnquiry,
  EnquiryMessage,
  Announcement,
  CreateAnnouncementData,
  Article
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

  static async getAdminEnquiries(): Promise<AdminEnquiry[]> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          users!enquiries_user_id_fkey (
            name,
            mobile
          ),
          enquiry_messages!inner (
            id,
            content,
            sender_type,
            created_at
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map((enquiry) => ({
        ...enquiry,
        users: enquiry.users,
        messages: enquiry.enquiry_messages
      }));
    } catch (error) {
      console.error('Error fetching admin enquiries:', error);
      throw error;
    }
  }

  static async getEnquiryMessages(enquiryId: string): Promise<EnquiryMessage[]> {
    try {
      const { data, error } = await supabase
        .from('enquiry_messages')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enquiry messages:', error);
      throw error;
    }
  }

  static async sendEnquiryMessage(
    enquiryId: string,
    content: string
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();

      // Insert the message
      const { error: messageError } = await supabase
        .from('enquiry_messages')
        .insert([
          {
            enquiry_id: enquiryId,
            content,
            sender_type: 'admin',
            created_at: timestamp
          }
        ]);

      if (messageError) throw messageError;

      // When admin replies, always set status to resolved
      const { error: statusError } = await supabase
        .from('enquiries')
        .update({ 
          status: 'resolved', 
          updated_at: timestamp 
        })
        .eq('id', enquiryId);

      if (statusError) throw statusError;
    } catch (error) {
      console.error('Error sending enquiry message:', error);
      throw error;
    }
  }

  static async getEnquiryById(enquiryId: string): Promise<AdminEnquiry> {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select(`
          *,
          users!enquiries_user_id_fkey (
            name,
            mobile
          ),
          enquiry_messages (
            id,
            content,
            sender_type,
            created_at
          )
        `)
        .eq('id', enquiryId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      throw error;
    }
  }

  static async updateEnquiryStatus(
    enquiryId: string,
    status: 'pending' | 'active' | 'resolved'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      throw error;
    }
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }

  static async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    try {
      const timestamp = new Date().toISOString();
      
      const { data: announcement, error } = await supabase
        .from('announcements')
        .insert([
          {
            title: data.title,
            description: data.description,
            image_url: data.image_url || null,
            link: data.link || null,
            status: data.status || 'draft',
            created_at: timestamp,
            updated_at: timestamp
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return announcement;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  static async updateAnnouncement(
    id: string,
    updates: Partial<Announcement>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  static async deleteAnnouncement(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  static async getArticles(): Promise<Article[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  static async createArticle(data: {
    title: string;
    description: string;
    content: string;
    image_url?: string;
    youtube_url?: string;
    active: boolean;
  }): Promise<Article> {
    try {
      console.log('Creating article with data:', data);
      const timestamp = new Date().toISOString();
      
      const { data: article, error } = await supabase
        .from('articles')
        .insert([
          {
            ...data,
            created_at: timestamp,
            updated_at: timestamp
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return article;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  static async updateArticle(
    id: string,
    data: Partial<Article>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('articles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  static async deleteArticle(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }
}
