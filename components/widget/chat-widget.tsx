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
  Newspaper,
  Mic
} from 'lucide-react';
import { HomeTab } from './tabs/home-tab';
import Image from 'next/image';
import { Tooltip } from '../tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageTab } from './tabs/message-tab';
import { EnquiryTab } from './tabs/enquiry-tab';
import { AnnouncementTab } from './tabs/announcement-tab';
import { ArticleTab } from './tabs/article-tab';
import { useWidget } from '@/contexts/widget-context';
import { Maximize2, Minimize2 } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', Icon: Crown },
  { id: 'message', label: 'AI Chat', Icon: Bot },
  { id: 'enquiry', label: 'Message', Icon: Send },
  { id: 'info', label: 'Info', Icon: Mic },
  { id: 'articles', label: 'Articles', Icon: Newspaper }
];

export function ChatWidget() {
  return <ChatWidgetContent />;
}

function ChatWidgetContent() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const isMobile = useIsMobile();
  const widgetRef = useRef<HTMLDivElement>(null);
  const { setIsExpanded } = useWidget();
  const [isExpanded, setIsExpandedState] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsWidgetOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleWidget = () => {
    const newState = !isWidgetOpen;
    setIsWidgetOpen(newState);
    
    // Send message to parent window
    if (typeof window !== 'undefined') {
      window.parent.postMessage({ 
        type: 'widget-toggle', 
        open: newState 
      }, '*');
    }
  };

  const closeWidget = () => {
    setIsWidgetOpen(false);
    // Send message to parent window
    if (typeof window !== 'undefined') {
      window.parent.postMessage({ 
        type: 'widget-toggle', 
        open: false 
      }, '*');
    }
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
          onClick={closeWidget}
          className='text-white hover:opacity-75'
        >
          <X size={20} className='text-gray-600' />
        </button>
      </div>
    );
  };

  const getWidgetDimensions = () => {
    if (isMobile) {
      return 'fixed inset-0 w-full h-full rounded-none';
    }

    if (isExpanded) {
      return `fixed bottom-4 right-4 
        2xl:w-[800px] 2xl:h-[700px]
        xl:w-[700px] xl:h-[600px]
        lg:w-[600px] lg:h-[540px]
        md:w-[500px] md:h-[500px]
        rounded-lg`;
    }

    return `fixed bottom-4 right-4
      2xl:w-[400px] 2xl:h-[600px]
      xl:w-[380px] xl:h-[600px]
      lg:w-[350px] lg:h-[500px]
      md:w-[320px] md:h-[480px]
      rounded-lg`;
  };

  const handleExpand = (expanded: boolean) => {
    setIsExpandedState(expanded);
    setIsExpanded(expanded);
  };

  // Add effect to handle tab changes
  useEffect(() => {
    if (activeTab !== 'articles') {
      handleExpand(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Update tab switching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId !== 'articles') {
      handleExpand(false);
    }
  };

  return (
    <div className='z-50' ref={widgetRef}>
      {/* Main Floating Button */}
      <div
        className={`fixed bottom-4 right-4 ${
          isMobile && isWidgetOpen ? 'hidden' : 'block'
        }`}
      >
        <button
          onClick={toggleWidget}
          className='w-full h-full flex items-center justify-center hover:scale-120 transition-all duration-300'
        >
          <Image
            src='/boy.gif'
            alt='Chat Icon'
            width={100}
            height={100}
            className='object-cover'
          />
        </button>
      </div>

      {/* Full Widget */}
      {isWidgetOpen && (
        <div
          className={`bg-white shadow-xl animate-scale-in transition-all duration-300
            ${getWidgetDimensions()}`}
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
                <HomeTab
                  onChatClick={() => setActiveTab('message')}
                  onClose={closeWidget}
                />
              )}
              {activeTab === 'message' && <MessageTab />}
              {activeTab === 'enquiry' && <EnquiryTab />}
              {activeTab === 'info' && <AnnouncementTab />}
              {activeTab === 'articles' && (
                <div className='h-full'>
                  <ArticleTab onExpand={handleExpand} />
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className='flex items-center justify-between border-t p-2 bg-white'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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
