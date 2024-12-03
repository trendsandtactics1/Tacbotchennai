import { ChatWidget } from '@/components/widget/chat-widget';
import './globals.css';

export default function Home() {
  return (
    <main className='min-h-screen p-8'>
      <h1 className='text-4xl font-bold'>Welcome to Your Website</h1>
      <p className='mt-4 text-lg text-gray-600'>
        Your content goes here. The chat widget will appear in the bottom right
        corner.
      </p>
      <ChatWidget />
    </main>
  );
}
