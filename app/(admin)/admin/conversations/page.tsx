import { ConversationsContent } from '@/components/admin/conversations/conversations-content';
import { Suspense } from 'react';

export default function ConversationsPage() {
  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Conversations</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <ConversationsContent />
      </Suspense>
    </div>
  );
}
