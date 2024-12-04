import { supabase } from '../supabase/client';
import type { Announcement } from '@/types/announcement';

export class AnnouncementService {
  static async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  }
}
