'use client';

import Image from 'next/image';
import { Bot, ChevronDown, Loader2, X } from 'lucide-react';
import * as Accordion from '@radix-ui/react-accordion';
import { useState, useEffect } from 'react';
import { AnnouncementService } from '@/lib/services/announcement-service';
import type { Announcement } from '@/types/announcement';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface HomeTabProps {
  onChatClick: () => void;
  onClose?: () => void;
}

export function HomeTab({ onChatClick, onClose }: HomeTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await AnnouncementService.getAnnouncements();
        // Only show the latest 3 announcements on home tab
        setAnnouncements(data.slice(0, 5));
      } catch (error) {
       
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const faqs = [
    {
      question: 'How can I start a conversation?',
      answer:
        'Click on the Message tab and start chatting with our AI assistant.'
    },
    {
      question: 'What are your business hours?',
      answer: 'We are available 24/7 through our AI chat support.'
    }
  ];

  return (
    <div className='flex flex-col gap-6 animate-fade-in p-4'>
      {/* Hero Section */}
      <div className='relative text-black'>
        <button
          onClick={onClose}
          className='absolute top-8 right-5 text-white hover:opacity-75'
          aria-label='Close widget'
        >
          <X size={20} className='text-white' />
        </button>
         <div className='flex justify-between p-5 rounded-lg mt-2 items-start mb-4'
     style={{ background: 'linear-gradient(to bottom, #0C2340, #005BAC)' }}>
      <div className='flex flex-col items-start gap-6'>
            <Image
              src='/logo.jpg'
              alt='Logo'
              width={100}
              height={100}
              className='h-20 w-20 rounded-full object-cover'
            />
            <div>
              <h1 className='text-[32px] font-semibold mb-2 text-white'>
                Hello there
              </h1>
              <h2 className='text-[24px] font-semibold text-white'>
                How can we help?
              </h2>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onChatClick}
className='bg-gradient-to-b flex items-center gap-4 justify-center text-base font-semibold hover:font-semibold from-[#0C2340] to-[#005BAC] text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300'      >
        Chat with Us <Bot className='w-6 h-6' />
      </button>

      {/* Recent Announcements */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-[14px] text-gray-800 px-1'>
          Recent Announcements
        </h3>
        {isLoading ? (
          <div className='flex justify-center items-center py-8'>
            <Loader2 className='w-6 h-6 animate-spin text-gray-500' />
          </div>
        ) : announcements.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            No announcements available
          </div>
        ) : (
          <div className='space-y-3'>
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className='bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 animate-fade-in'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {announcement.image_url && (
                  <div className='relative w-full h-80 mb-3 rounded-lg overflow-hidden'>
                    <Image
                      src={announcement.image_url}
                      alt={announcement.title}
                      fill
                      className='object-cover'
                      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className='space-y-2'>
                  <h4 className='font-medium text-[14px] leading-6 text-gray-800'>
                    {announcement.title}
                  </h4>
                  <p className='text-sm text-gray-600 text-[13px] leading-6'>
                    {announcement.description}
                  </p>
                  {announcement.link && (
                    <Link
                      href={announcement.link}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 text-sm hover:underline inline-block'
                    >
                      Learn more
                    </Link>
                  )}
                  <span className='text-xs text-gray-400 block'>
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className='space-y-4'>
        <h3 className='font-semibold text-[14px] text-gray-800 px-1'>
          Frequently Asked Questions
        </h3>
        <Accordion.Root type='single' collapsible className='space-y-2'>
          {faqs.map((faq, index) => (
            <Accordion.Item
              key={index}
              value={`item-${index}`}
              className='bg-white border rounded-lg overflow-hidden animate-fade-in'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Accordion.Trigger className='flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors'>
                <span className='font-medium text-gray-600 text-[14px] leading-6'>
                  {faq.question}
                </span>
                <ChevronDown className='h-4 w-4 text-gray-500 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180' />
              </Accordion.Trigger>
              <Accordion.Content className='overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp'>
                <div className='p-4 pt-0 text-sm text-gray-600 text-[13px] leading-6'>
                  {faq.answer}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
}
