import { SignInForm } from '@/components/auth/sign-in-form';
import { Logo } from '@/components/logo';

export default function SignInPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='w-full max-w-md space-y-8'>
        <div className='flex flex-col items-center'>
          <Logo className='h-12 w-12' />
          <h2 className='mt-6 text-3xl font-bold'>Sign in to Admin Panel</h2>
          <p className='mt-2 text-gray-600'>
            Enter your credentials to access the admin panel
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
