// src/app/layout.tsx
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${poppins.variable} font-poppins`}>
        {children}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff'
            },
            success: {
              duration: 3000,
              style: {
                background: '#22c55e'
              }
            },
            error: {
              duration: 3000,
              style: {
                background: '#ef4444'
              }
            },
            loading: {
              duration: Infinity,
              style: {
                background: '#363636'
              }
            }
          }}
        />
      </body>
    </html>
  );
}
