import { Card } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

const HomeFAQ = () => {
  const faqs = [
    {
      question: 'How can I start a conversation?',
      answer:
        "Click on the 'Ask a question' button at the top of the chat to begin chatting with our AI assistant."
    },
    {
      question: 'Can I speak with a human agent?',
      answer:
        'Yes! You can connect with one of our available agents by selecting them from the list above.'
    },
    {
      question: 'How do I submit a complaint?',
      answer:
        'Navigate to the complaint section using the bottom navigation bar and follow the guided process.'
    }
  ];

  return (
    <div className='mt-8'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        Frequently Asked Questions
      </h3>
      <Card className='p-4'>
        <Accordion type='single' collapsible className='w-full'>
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className='text-sm hover:no-underline'>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className='text-sm text-gray-600'>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default HomeFAQ;
