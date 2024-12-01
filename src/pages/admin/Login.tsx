import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthError } from '@supabase/supabase-js';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/admin/dashboard');
      }
    });

    // Handle auth error events
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        toast({
          title: 'Signed out',
          description: 'You have been signed out successfully'
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <Card className='w-full max-w-md p-6'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Admin Login</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            className: {
              container: 'space-y-4',
              button: 'rounded-md',
              input: 'rounded-md'
            }
          }}
          theme='light'
          providers={[]}
          view='sign_in'
          showLinks={false}
        />
      </Card>
    </div>
  );
}
