import { supabase } from '@/integrations/supabase/client';

interface Document {
  id: string;
  content: string;
  metadata: {
    source_url?: string;
    title?: string;
    description?: string;
  };
  similarity?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  status?: 'pending' | 'resolved' | 'closed' | 'error';
}

async function searchDocuments(query: string): Promise<Document[]> {
  try {
    // Extract meaningful keywords
    const keywords = query
      .toLowerCase()
      .split(' ')
      .filter(
        (word) =>
          word.length > 2 &&
          !['the', 'and', 'but', 'for', 'with'].includes(word)
      );

    // Search documents with full-text search
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .textSearch('content', keywords.join(' | '), {
        type: 'websearch',
        config: 'english'
      })
      .limit(10);

    if (error) throw error;

    // Calculate similarity scores
    const scoredDocs = (data || [])
      .map((doc) => ({
        ...doc,
        similarity: calculateSimilarity(query, doc.content)
      }))
      .sort((a, b) => b.similarity - a.similarity);

    return scoredDocs;
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
}

function calculateSimilarity(query: string, content: string): number {
  const queryWords = new Set(query.toLowerCase().split(/\W+/));
  const contentWords = content.toLowerCase().split(/\W+/);

  let matches = 0;
  let relevanceScore = 0;

  queryWords.forEach((word) => {
    if (word.length < 1) return; // Skip short words

    const regex = new RegExp(word, 'gi');
    const wordMatches = (content.match(regex) || []).length;

    if (wordMatches > 0) {
      matches++;
      relevanceScore += wordMatches;
    }
  });

  // Combined score based on word matches and frequency
  return (matches / queryWords.size) * (1 + Math.min(relevanceScore / 100, 1));
}

function generateResponse(query: string, documents: Document[]): string {
  if (documents.length === 0) {
    return getDefaultResponse(query);
  }

  // Get top relevant documents
  const topDocs = documents.slice(0, 3);
  const relevantSentences: string[] = [];

  topDocs.forEach((doc) => {
    const sentences = doc.content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20); // Filter out very short sentences

    // Find relevant sentences
    const docSentences = sentences.filter((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      return query
        .toLowerCase()
        .split(' ')
        .some((word) => word.length > 3 && sentenceLower.includes(word));
    });

    relevantSentences.push(...docSentences.slice(0, 2));
  });

  if (relevantSentences.length > 0) {
    // Remove duplicates and combine sentences
    const uniqueSentences = Array.from(new Set(relevantSentences)).slice(0, 3);

    const response = uniqueSentences.join('. ');

    // Add source attribution
    const sources = topDocs
      .map((doc) => doc.metadata.source_url)
      .filter(Boolean)
      .slice(0, 2);

    const sourceText =
      sources.length > 0 ? ` (Sources: ${sources.join(', ')})` : '';

    return `Based on our information${sourceText}: ${response}.`;
  }

  return `Based on our information: ${documents[0].content.split('.')[0]}.`;
}

function getDefaultResponse(query: string): string {
  const defaultResponses = {
    greeting: [
      'Hello! How can I help you today?',
      'Hi there! What can I assist you with?',
      'Welcome! How may I help you?'
    ],
    unknown: [
      "I don't have specific information about that. Could you try asking something else?",
      "I'm not sure about that. Could you rephrase your question?",
      "I don't have enough information to answer that question accurately."
    ]
  };

  if (query.toLowerCase().match(/hello|hi|hey/)) {
    return defaultResponses.greeting[
      Math.floor(Math.random() * defaultResponses.greeting.length)
    ];
  }

  return defaultResponses.unknown[
    Math.floor(Math.random() * defaultResponses.unknown.length)
  ];
}

export async function sendMessage(
  sessionId: string,
  message: string,
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void,
  setIsLoading: (loading: boolean) => void
) {
  try {
    setIsLoading(true);

    // Save user message
    const { data: messageData, error: messageError } = await supabase
      .from('conversations')
      .insert([
        {
          session_id: sessionId,
          message,
          sender: 'user',
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (messageError) throw messageError;

    const userMessage: ChatMessage = {
      id: messageData.id,
      content: message,
      isUser: true,
      timestamp: new Date(),
      status: 'pending'
    };

    setMessages((prev) => [...prev, userMessage]);

    // Search documents and generate response
    const relevantDocs = await searchDocuments(message);
    const aiResponse = generateResponse(message, relevantDocs);

    // Add artificial delay for natural feel
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Save AI response
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('conversations')
      .insert([
        {
          session_id: sessionId,
          message: aiResponse,
          sender: 'assistant',
          timestamp: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    const assistantMessage: ChatMessage = {
      id: aiMessageData.id,
      content: aiResponse,
      isUser: false,
      timestamp: new Date(),
      status: 'pending'
    };

    setMessages((prev) => [...prev, assistantMessage]);
  } catch (error) {
    console.error('Error in sendMessage:', error);

    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      content: 'Sorry, I encountered an error. Please try again.',
      isUser: false,
      timestamp: new Date(),
      status: 'error'
    };

    setMessages((prev) => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
}

export async function updateConversationStatus(
  messageId: string,
  status: 'pending' | 'resolved' | 'closed'
) {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', messageId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
}
