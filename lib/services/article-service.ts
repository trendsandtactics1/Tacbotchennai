import { supabase } from '../supabase/client';
import type { Article } from '@/types/admin';

export class ArticleService {
  static async getArticles(): Promise<Article[]> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  static async createArticle(data: Partial<Article>): Promise<Article> {
    try {
      const { data: article, error } = await supabase
        .from('articles')
        .insert([
          {
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return article;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  static async updateArticle(id: string, data: Partial<Article>): Promise<void> {
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
