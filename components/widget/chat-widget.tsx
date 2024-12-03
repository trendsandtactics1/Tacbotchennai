'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Crown,
  FileQuestion,
  Info,
  Book,
  Bot,
  MessageCircleHeart,
  Send,
  MicVocalIcon,
  Newspaper
} from 'lucide-react';
import { HomeTab } from './tabs/home-tab';
import Image from 'next/image';
import { Tooltip } from '../tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageTab } from './tabs/message-tab';
import { EnquiryTab } from './tabs/enquiry-tab';
import { AnnouncementTab } from './tabs/announcement-tab';
import { ArticleTab } from './tabs/article-tab';
import { useWidget, WidgetProvider } from '@/contexts/widget-context';
import { Maximize2, Minimize2 } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', Icon: Crown },
  { id: 'message', label: 'AI Chat', Icon: Bot },
  { id: 'enquiry', label: 'Message', Icon: Send },
  { id: 'info', label: 'Info', Icon: MicVocalIcon },
  { id: 'articles', label: 'Articles', Icon: Newspaper }
];

export function ChatWidget() {
  return (
    <WidgetProvider>
      <ChatWidgetContent />
    </WidgetProvider>
  );
}

function ChatWidgetContent() {
  const [isIconsOpen, setIsIconsOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const isMobile = useIsMobile();
  const widgetRef = useRef<HTMLDivElement>(null);
  const { isExpanded, setIsExpanded } = useWidget();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsWidgetOpen(false);
        setIsIconsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleIcons = () => {
    if (isWidgetOpen) {
      setIsWidgetOpen(false);
    } else {
      setIsIconsOpen(!isIconsOpen);
    }
  };

  const handleIconClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsWidgetOpen(true);
    setIsIconsOpen(false);
  };

  const renderHeader = () => {
    if (activeTab === 'home') return null;

    return (
      <div className='flex items-center justify-between bg-white text-black p-4 rounded-t-lg'>
        <div className='flex items-center gap-2'>
          <div className='h-16 w-16 rounded-full bg-white overflow-hidden'>
            <Image
              src='/logo.jpg'
              alt='JKKN Logo'
              width={100}
              height={100}
              className='object-cover'
            />
          </div>
          <div className='text-black'>
            <h3 className='font-semibold'>TC Chat Bot</h3>
            <p className='text-sm opacity-90'>Answer Instantly</p>
          </div>
        </div>
        <button
          onClick={() => setIsWidgetOpen(false)}
          className='text-white hover:opacity-75'
        >
          <X size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className='z-50' ref={widgetRef}>
      {/* Main Floating Button */}
      <div
        className={`fixed bottom-4 right-6 ${
          isMobile && isWidgetOpen ? 'hidden' : 'block'
        }`}
      >
        <button
          onClick={toggleIcons}
          className='h-12 w-12 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all duration-300'
        >
          <MessageCircle size={24} />
        </button>

        {/* Icons Menu */}
        <div
          className={`absolute bottom-16 right-0 transition-all duration-300 origin-bottom-right ${
            isIconsOpen
              ? 'scale-100 opacity-100'
              : 'scale-95 opacity-0 pointer-events-none'
          }`}
        >
          <div className='bg-white rounded-lg shadow-xl p-2'>
            <div className='flex flex-col gap-3'>
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  className='animate-in fade-in'
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Tooltip text={tab.label}>
                    <button
                      onClick={() => handleIconClick(tab.id)}
                      className='h-10 w-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative group'
                    >
                      <tab.Icon
                        size={20}
                        className='text-gray-700 transition-transform duration-200 group-hover:scale-110'
                      />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Widget */}
      {isWidgetOpen && (
        <div
          className={`bg-white shadow-xl animate-scale-in transition-all duration-300
            ${
              isMobile
                ? 'fixed inset-0 w-full h-full rounded-none'
                : isExpanded
                ? 'fixed bottom-4 right-6 w-[700px] h-[600px] rounded-lg'
                : 'fixed bottom-4 right-6 w-96 h-[600px] rounded-lg'
            }`}
        >
          {/* Conditional Header */}
          {renderHeader()}

          {/* Content */}
          <div
            className={`flex flex-col ${
              activeTab === 'home' ? 'h-full' : 'h-[calc(100%-95px)]'
            }`}
          >
            <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide scroll-smooth'>
              {activeTab === 'home' && (
                <HomeTab onChatClick={() => setActiveTab('message')} />
              )}
              {activeTab === 'message' && <MessageTab />}
              {activeTab === 'enquiry' && <EnquiryTab />}
              {activeTab === 'info' && <AnnouncementTab />}
              {activeTab === 'articles' && (
                <div className='h-full'>
                  <ArticleTab />
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className='flex items-center justify-between border-t p-2 bg-white'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <tab.Icon size={20} />
                  <span className='text-xs mt-1 text-gray-800'>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
