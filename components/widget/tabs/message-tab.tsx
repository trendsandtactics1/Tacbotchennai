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

/** Helper to compose a response WITHOUT keywords block */
function composeReply(bodyParagraphs: string[], bullets: string[]): string {
  const body = bodyParagraphs.join('\n\n');
  const bulletBlock = bullets.length ? `• ${bullets.join('\n• ')}` : '';
  // Keep transfer-button so your UI shows Talk to Agent / Admission
  return [body, bulletBlock, 'transfer-button'].filter(Boolean).join('\n\n');
}

/** Keyword-based responder (answers depend on detected keywords, but no “Keywords:” in output) */
function getBotReply(raw: string): string {
  const q = raw.toLowerCase();

  // ======== NEW Q&A YOU ASKED TO ADD ========

  // Q1: Academic year & when to apply
  if (
    q.includes('academic year') ||
    q.includes('when should i apply') ||
    (q.includes('apply') && q.includes('when')) ||
    q.includes('admission timeline') ||
    q.includes('admissions timeline')
  ) {
    return composeReply(
      [
        'Our academic year typically begins in June 2026. Applications open several months prior.',
        'We recommend applying as early as possible to secure a seat.',
      ],
      ['Academic year starts: June 2026', 'Apply early to secure a seat']
    );
  }

  // Q2: Curriculum
  if (q.includes('curriculum') || q.includes('cbse')) {
    return composeReply(
      [
        'We follow the CBSE curriculum, emphasizing conceptual understanding, analytical thinking, and holistic development.',
        'Our approach blends academic excellence with project-based learning, co-scholastic activities, and real-world applications — preparing students to be confident, responsible, and globally aware.',
      ],
      ['Board: CBSE', 'Project-based learning', 'Holistic development']
    );
  }

  // Q3: Transport
  if (q.includes('transport') || q.includes('bus') || q.includes('route')) {
    return composeReply(
      [
        'Yes — school bus transport is provided across specified routes in and around Coimbatore.',
        'Route details, pickup/drop timings, and fees are available from the transport office.',
      ],
      ['Transport available', 'Coverage: Coimbatore & nearby routes']
    );
  }

  // ======== EXISTING ANSWERS ========

  // Founder
  if (q.includes('founder')) {
    return composeReply(
      [
        'K. P. Ramasamy is the Founder & Chairman of KPR Group and KPR Institutions.',
        'He co-founded KPR Mill Limited and established KPR Institute of Engineering and Technology (KPRIET) in Coimbatore.',
      ],
      [
        'Founder & Chairman: K. P. Ramasamy',
        'KPR Mill Limited co-founder',
        'KPRIET established in Coimbatore',
      ]
    );
  }

  // About / Bio
  if (
    q.includes('tell me more') ||
    q.includes('about him') ||
    q.includes('bio') ||
    q.includes('k. p. ramasamy') ||
    q.includes('kpr ramasamy')
  ) {
    return composeReply(
      ['About K. P. Ramasamy (KPR):'],
      [
        'Born in 1949 near Erode, Tamil Nadu',
        'Started a power-loom business in 1971 with just ₹8,000',
        'Grew it into KPR Mill Limited',
        'Known for employee-centric, women-focused skilling & education',
      ]
    );
  }

  // KPR Mill
  if (q.includes('kpr mill')) {
    return composeReply(
      ['KPR Mill Limited is a major textile company co-founded by K. P. Ramasamy.'],
      ['Textiles & apparel manufacturing', 'Scaled from a small power-loom beginning']
    );
  }

  // KPRIET / Institute
  if (q.includes('kpriet') || (q.includes('institute') && q.includes('engineering'))) {
    return composeReply(
      ['KPR Institute of Engineering and Technology (KPRIET) is part of KPR Institutions, based in Coimbatore, Tamil Nadu.'],
      ['Engineering & technology programs', 'Campus: Coimbatore, Tamil Nadu']
    );
  }

  // Admissions / Enquiry
  if (q.includes('admission') || q.includes('enquiry') || q.includes('apply') || q.includes('application')) {
    return composeReply(
      ['For admissions and program enquiries, use the Admission button below or talk to an agent.'],
      ['Guidance on programs & eligibility', 'Applications & timelines']
    );
  }

  // Location / Address
  if (q.includes('location') || q.includes('where') || q.includes('address') || q.includes('campus')) {
    return composeReply(
      ['KPR Institutions include KPRIET, located in Coimbatore, Tamil Nadu, India.'],
      ['City: Coimbatore', 'State: Tamil Nadu', 'Country: India']
    );
  }

  // Initiatives / Employees / Women / Education / Skills
  if (q.includes('women') || q.includes('empowerment') || q.includes('employee') || q.includes('education') || q.includes('skill')) {
    return composeReply(
      ['K. P. Ramasamy is known for employee-centric initiatives—especially uplifting women—through education and skilling programs.'],
      ['Women empowerment', 'Education & skilling']
    );
  }

  // 1971 / ₹8,000 / Startup story
  if (q.includes('1971') || q.includes('₹8,000') || q.includes('8000') || q.includes('power-loom') || q.includes('power loom')) {
    return composeReply(
      ['In 1971, with just ₹8,000, K. P. Ramasamy started a tiny power-loom business that grew into KPR Mill Limited.'],
      ['1971 origin', '₹8,000 initial capital', 'Scaled to a major enterprise']
    );
  }

  // Default helpful fallback
  return composeReply(
    ['I can help with KPR Institutions, the Founder, KPR Mill, KPRIET, admissions, transport, curriculum, and more. Try asking:'],
    [
      'What curriculum do you follow?',
      'Is transport provided?',
      'When does the academic year start?',
      'Who is the founder of KPR Institutions?',
      'Admissions and programs at KPRIET',
    ]
  );
}

export function MessageTab({ onTabChange }: MessageTabProps) {
  const [view] = useState<View>('chat');
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'bot'; content: string }>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // === Auto-scroll to the latest message ===
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Smooth scroll whenever messages change, so user sees the newest answer (e.g., for Q2)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim() || isSending) return;

    const userText = currentMessage;
    setCurrentMessage('');
    setIsSending(true);

    // Append user's message
    setMessages((prev) => [...prev, { type: 'user', content: userText }]);

    // Generate and append bot reply
    const botText = getBotReply(userText);
    setMessages((prev) => [...prev, { type: 'bot', content: botText }]);

    setIsSending(false);
  };

  const handleBackToList = () => {
    // No-op; keep if you want the icon in the header
  };

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
                className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={20} className="text-gray-600" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    message.type === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === 'user' ? (
                    <p className="text-[13px] leading-6">{message.content}</p>
                  ) : (
                    <div className="space-y-5">
                      {formatAIResponse(message.content).map((section: AIResponseSection, idx: number) => (
                        <div key={idx}>
                          {section.type === 'list' ? (
                            <ul className="space-y-3">
                              {(section.content as string[]).map((item: string, itemIdx: number) => (
                                <li key={itemIdx} className="flex items-start gap-3">
                                  <span className="text-gray-700 mt-1">•</span>
                                  <span className="text-[13px] leading-6">{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : section.type === 'buttons' ? (
                            <div className="flex gap-3 mt-2">
                              <button
                                onClick={() => onTabChange('enquiry')}
                                className="px-2 py-2 text-[14px] font-semibold bg-black text-white rounded-lg hover:bg-black transition-colors"
                              >
                                Talk to Agent
                              </button>
                              <Link
                                href="https://portal.tipsglobal.org/ParentHome/OnlineEnquiryForm"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-2 text-[14px] font-semibold bg-black text-white rounded-lg hover:bg-black transition-colors"
                              >
                                Admission
                              </Link>
                            </div>
                          ) : (
                            <p className="text-[13px] text-black leading-6 tracking-wide">
                              {(section.content as string).split('\n').map((line: string, i: number) => (
                                <span key={i} className="block mb-2 last:mb-0">
                                  {line || <br />}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
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

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-2 sm:p-4">
            <div className="flex gap-2 max-w-full">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                className="shrink-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Send message"
                disabled={!currentMessage.trim() || isSending}
              >
                {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
