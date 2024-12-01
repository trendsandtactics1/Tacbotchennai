import { supabase } from '@/integrations/supabase/client';

export async function signUpAdmin(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          is_admin: true,
          name: name,
          role: 'admin'
        },
        emailRedirectTo: `${window.location.origin}/admin/login`
      }
    });

    if (error) throw error;

    // Optionally, you can also create the admin profile manually if needed
    if (data.user) {
      const { error: profileError } = await supabase
        .from('admin_profiles')
        .insert([
          {
            user_id: data.user.id,
            name: name,
            created_at: new Date().toISOString()
          }
        ])
        .single();

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
      }
    }

    return data;
  } catch (error) {
    console.error('Error in signUpAdmin:', error);
    throw error;
  }
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return !!profile;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 