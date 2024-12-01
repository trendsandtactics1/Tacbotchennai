import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: Date;
  status?: 'pending' | 'resolved' | 'closed';
  agentName?: string;
}

export const sendMessage = async (
  sessionId: string,
  message: string,
  updateMessages: (updater: (messages: ChatMessage[]) => ChatMessage[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const userMessage: ChatMessage = { 
    id: Date.now().toString(), 
    content: message, 
    isUser: true,
    timestamp: new Date(),
    status: 'pending'
  };
  
  updateMessages(prev => [...prev, userMessage]);
  setIsLoading(true);

  try {
    // Store user message
    await supabase.from("conversations").insert({
      session_id: sessionId,
      sender: "user",
      message: message,
      status: 'pending'
    });

    // Get relevant documents
    const { data: matchResponse } = await supabase.functions.invoke('match-documents', {
      body: { query: message }
    });

    // Call chat function using Supabase Functions
    const { data: response, error } = await supabase.functions.invoke('chat', {
      body: { 
        message,
        context: matchResponse?.documents?.map((doc: any) => doc.content).join('\n') || ''
      }
    });

    if (error) throw error;

    if (!response) {
      throw new Error('No response from chat function');
    }

    const botMessageId = Date.now() + 1;
    let botMessage = "";

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    updateMessages(prev => [...prev, { 
      id: botMessageId.toString(), 
      content: "", 
      isUser: false,
      timestamp: new Date(),
      status: 'pending' as const
    }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(5);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            botMessage += content;

            updateMessages(prev => 
              prev.map(msg => 
                msg.id === botMessageId.toString() 
                  ? { ...msg, content: botMessage }
                  : msg
              )
            );
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }

    // Store bot message
    await supabase.from("conversations").insert({
      session_id: sessionId,
      sender: "bot",
      message: botMessage,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

export const updateConversationStatus = async (sessionId: string, status: 'pending' | 'resolved' | 'closed') => {
  const { error } = await supabase
    .from('conversations')
    .update({ status })
    .eq('session_id', sessionId);

  if (error) throw error;
};