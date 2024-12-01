import { supabase } from '@/integrations/supabase/client';

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 