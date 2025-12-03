// components/widget/tabs/message-tab.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, Bot, Loader2, User } from 'lucide-react';
import Link from 'next/link';

type View = 'chat';

interface AIResponseSection {
  type: 'list' | 'text' | 'buttons';
  content: string | string[] | { transfer: boolean; continue: boolean };
}

/** Keep renderer contract: split by double newlines + detect bullets/buttons/text */
const formatAIResponse = (content: string): AIResponseSection[] => {
  const sections = content.split('\n\n');
  return sections.map((section) => {
    if (section.includes('transfer-button')) {
      return { type: 'buttons', content: { transfer: true, continue: true } };
    }
    if (section.includes('•')) {
      return {
        type: 'list',
        content: section
          .split('•')
          .filter(Boolean)
          .map((item) => item.trim()),
      };
    }
    return { type: 'text', content: section };
  });
};

interface MessageTabProps {
  onTabChange: (tab: string) => void;
}

/** Helper to compose response WITHOUT keywords visible */
function composeReply(bodyParagraphs: string[], bullets: string[]): string {
  const body = bodyParagraphs.join('\n\n');
  const bulletBlock = bullets.length ? `• ${bullets.join('\n• ')}` : '';
  return [body, bulletBlock, 'transfer-button'].filter(Boolean).join('\n\n');
}

/** ============================================
 *   BOT LOGIC — ONLY 2 ANSWERS ALLOWED
 * ============================================ */
function getBotReply(raw: string): string {
  const q = raw.toLowerCase();

  // 1 — School location in Pudupakkam
  if (
    q.includes('where') &&
    (q.includes('school') || q.includes('located')) &&
    q.includes('pudupakkam')
  ) {
    return composeReply(
      [
        'Our school is located in Pudupakkam with convenient access from nearby residential communities.',
      ],
      ['Location: Pudupakkam']
    );
  }

  // 2 — JOIS Homer Eduship Curriculum
  if (
    q.includes('curriculum') ||
    q.includes('homer eduship') ||
    q.includes('education')
  ) {
    return composeReply(
      [
        'At JOIS, the Homer Eduship Curriculum is more than education—it’s a voyage.',
        'From curiosity to confidence, from seeds to soaring, every child is prepared to thrive in school and in life.',
      ],
      ['Homer Eduship Curriculum', 'Focus: Curiosity → Confidence']
    );
  }

  // Fallback — Everything else
  return composeReply(
    [
      'I can help with information about our Pudupakkam school location or the JOIS Homer Eduship Curriculum.',
    ],
    ['Ask about location', 'Ask about curriculum']
  );
}

export function MessageTab({ onTabChange }: MessageTabProps) {
  const [view] = useState<View>('chat');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; content: string }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isSending) return;

    const userText = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    setMessages((prev) => [...prev, { type: 'user', content: userText }]);

    const botText = getBotReply(userText);
    setMessages((prev) => [...prev, { type: 'bot', content: botText }]);

    setIsSending(false);
  };

  const handleBackToList = () => {};

  return (
    <div className="flex flex-col h-full">
      {view === 'chat' && (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 border-b">
            <button onClick={handleBackToList} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <span className="text-sm">Start a conversation…</span>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Bot size={20} className="text-gray-600" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    message.type === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'user' ? (
                    <p className="text-[13px] leading-6">{message.content}</p>
                  ) : (
                    <div className="space-y-5">
                      {formatAIResponse(message.content).map(
                        (section: AIResponseSection, idx: number) => (
                          <div key={idx}>
                            {section.type === 'list' ? (
                              <ul className="space-y-3">
                                {(section.content as string[]).map(
                                  (item: string, itemIdx: number) => (
                                    <li
                                      key={itemIdx}
                                      className="flex items-start gap-3"
                                    >
                                      <span className="text-gray-700 mt-1">
                                        •
                                      </span>
                                      <span className="text-[13px] leading-6">
                                        {item}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : section.type === 'buttons' ? (
                              <div className="flex gap-3 mt-2">
                                <button
                                  onClick={() => onTabChange('enquiry')}
                                  className="px-2 py-2 text-[14px] font-semibold bg-black text-white rounded-lg"
                                >
                                  Talk to Agent
                                </button>
                                <Link
                                  href="https://portal.tipsglobal.org/ParentHome/OnlineEnquiryForm"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-2 text-[14px] font-semibold bg-black text-white rounded-lg"
                                >
                                  Admission
                                </Link>
                              </div>
                            ) : (
                              <p className="text-[13px] text-black leading-6 tracking-wide">
                                {(section.content as string)
                                  .split('\n')
                                  .map((line: string, i: number) => (
                                    <span
                                      key={i}
                                      className="block mb-2 last:mb-0"
                                    >
                                      {line || <br />}
                                    </span>
                                  ))}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot size={20} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-2 sm:p-4">
            <div className="flex gap-2 max-w-full">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-black"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                />
              </div>

              <button
                onClick={handleSendMessage}
                className="shrink-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                aria-label="Send message"
                disabled={!currentMessage.trim() || isSending}
              >
                {isSending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
