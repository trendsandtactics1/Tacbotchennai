// src/app/layout.tsx
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body
        className='font-sans'
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}
      >
        {children}
        <Toaster
          position='top-right'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
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
