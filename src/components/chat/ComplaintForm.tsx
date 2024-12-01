import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComplaintFormProps {
  agentId: string;
  onSubmit: (complaintId: string) => void;
}

const ComplaintForm = ({ agentId, onSubmit }: ComplaintFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const currentSessionId = localStorage.getItem('currentSessionId');
    setSessionId(currentSessionId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      if (!message.trim()) {
        throw new Error('Please enter your message');
      }

      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // Create complaint
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .insert({
          session_id: sessionId,
          agent_id: agentId,
          user_message: message.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (complaintError) throw complaintError;

      toast({
        title: 'Success',
        description: 'Your complaint has been submitted successfully'
      });

      onSubmit(complaint.id);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit complaint',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Submit a Complaint</h3>
        <p className="text-sm text-gray-500">Describe your issue in detail</p>
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your complaint here..."
        className="min-h-[150px] resize-none"
        required
      />
      
      <Button 
        type="submit" 
        disabled={isSubmitting || !message.trim() || !sessionId}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit Complaint"}
      </Button>
    </form>
  );
};

export default ComplaintForm;