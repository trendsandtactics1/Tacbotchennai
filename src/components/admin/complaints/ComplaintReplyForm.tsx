import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ComplaintReplyFormProps {
  sessionId: string;
  onSubmit: (message: string) => Promise<void>;
}

export function ComplaintReplyForm({ 
  sessionId, 
  onSubmit 
}: ComplaintReplyFormProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(message);
      setMessage(""); // Clear message on successful submit
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your reply..."
          className="min-h-[80px] flex-1 resize-none"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !message.trim()}
          className="self-end shrink-0"
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </form>
  );
}