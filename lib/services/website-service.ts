import { supabase } from '../supabase/client';
import type { Document } from '@/types/admin';

export class WebsiteService {
  static async getDocuments(): Promise<Document[]> {
    try {
      console.log('Fetching documents...');
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched documents:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async processWebsite(url: string): Promise<void> {
    try {
      const response = await fetch('/api/process-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process website');
      }
    } catch (error) {
      console.error('Error processing website:', error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
} 