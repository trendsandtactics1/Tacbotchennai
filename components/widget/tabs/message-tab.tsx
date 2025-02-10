import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: Array<{
    text: string;
    value: string;
  }>;
}

const initialMessage: Message = {
  id: '1',
  type: 'bot',
  content: 'Hello! How can I help you today?',
  options: [
    { text: 'Learn about our courses', value: 'COURSES' },
    { text: 'Admission process', value: 'ADMISSION' },
    { text: 'Campus facilities', value: 'FACILITIES' },
    { text: 'Contact information', value: 'CONTACT' },
  ],
};

const responseMap: Record<string, Message> = {
  COURSES: {
    id: 'courses',
    type: 'bot',
    content: 'We offer several courses:',
    options: [
      { text: 'Computer Science', value: 'CS' },
      { text: 'Business Management', value: 'BM' },
      { text: 'Engineering', value: 'ENG' },
      { text: 'Back to main menu', value: 'MAIN' },
    ],
  },
  ADMISSION: {
    id: 'admission',
    type: 'bot',
    content: "Here's information about our admission process:",
    options: [
      { text: 'Application requirements', value: 'REQ' },
      { text: 'Important dates', value: 'DATES' },
      { text: 'Fee structure', value: 'FEES' },
      { text: 'Back to main menu', value: 'MAIN' },
    ],
  },
  FACILITIES: {
    id: 'facilities',
    type: 'bot',
    content: 'Our campus offers modern facilities:',
    options: [
      { text: 'Library', value: 'LIB' },
      { text: 'Sports complex', value: 'SPORTS' },
      { text: 'Labs and workshops', value: 'LABS' },
      { text: 'Back to main menu', value: 'MAIN' },
    ],
  },
  CONTACT: {
    id: 'contact',
    type: 'bot',
    content: 'You can reach us through:',
    options: [
      { text: 'Email us', value: 'EMAIL' },
      { text: 'Call us', value: 'CALL' },
      { text: 'Visit campus', value: 'VISIT' },
      { text: 'Back to main menu', value: 'MAIN' },
    ],
  },
  MAIN: {
    id: 'main',
    type: 'bot',
    content: 'What else would you like to know?',
    options: [
      { text: 'Learn about our courses', value: 'COURSES' },
      { text: 'Admission process', value: 'ADMISSION' },
      { text: 'Campus facilities', value: 'FACILITIES' },
      { text: 'Contact information', value: 'CONTACT' },
    ],
  },
};

interface MessageTabProps {
  onTabChange: (tab: string) => void;
}

export function MessageTab({ onTabChange }: MessageTabProps) {
  // ... keep existing code
}
