import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ChatFlow {
  id: string;
  message: string;
  buttons: Array<{
    text: string;
    nextFlow: string;
  }>;
}

const chatFlows: Record<string, ChatFlow> = {
  start: {
    id: 'start',
    message: 'Welcome! How can I help you today?',
    buttons: [
      { text: 'Admission Information', nextFlow: 'admission' },
      { text: 'Fee Structure', nextFlow: 'fees' },
      { text: 'Campus Details', nextFlow: 'campus' },
      { text: 'Courses Offered', nextFlow: 'courses' }
    ]
  },
  admission: {
    id: 'admission',
    message: 'What would you like to know about admissions?',
    buttons: [
      { text: 'Application Process', nextFlow: 'application_process' },
      { text: 'Required Documents', nextFlow: 'documents' },
      { text: 'Important Dates', nextFlow: 'admission_dates' },
      { text: 'Back to Main Menu', nextFlow: 'start' }
    ]
  },
  fees: {
    id: 'fees',
    message: 'What fee information are you looking for?',
    buttons: [
      { text: 'Tuition Fees', nextFlow: 'tuition_fees' },
      { text: 'Payment Schedule', nextFlow: 'payment_schedule' },
      { text: 'Scholarships', nextFlow: 'scholarships' },
      { text: 'Back to Main Menu', nextFlow: 'start' }
    ]
  },
  campus: {
    id: 'campus',
    message: 'Our Chennai campus facilities include:',
    buttons: [
      { text: 'Infrastructure', nextFlow: 'infrastructure' },
      { text: 'Hostels', nextFlow: 'hostels' },
      { text: 'Transport', nextFlow: 'transport' },
      { text: 'Back to Main Menu', nextFlow: 'start' }
    ]
  },
  courses: {
    id: 'courses',
    message: 'Which program are you interested in?',
    buttons: [
      { text: 'Undergraduate', nextFlow: 'ug_courses' },
      { text: 'Postgraduate', nextFlow: 'pg_courses' },
      { text: 'Diploma Programs', nextFlow: 'diploma' },
      { text: 'Back to Main Menu', nextFlow: 'start' }
    ]
  },
  application_process: {
    id: 'application_process',
    message: 'Would you like to know more about our application process?',
    buttons: [
      { text: 'Online Application', nextFlow: 'online_application' },
      { text: 'Entrance Exam', nextFlow: 'entrance_exam' },
      { text: 'Interview Process', nextFlow: 'interview' },
      { text: 'Back to Admissions', nextFlow: 'admission' }
    ]
  },
  documents: {
    id: 'documents',
    message: 'Which documents would you like to know about?',
    buttons: [
      { text: 'Academic Documents', nextFlow: 'academic_docs' },
      { text: 'Identity Proof', nextFlow: 'identity_docs' },
      { text: 'Additional Documents', nextFlow: 'additional_docs' },
      { text: 'Back to Admissions', nextFlow: 'admission' }
    ]
  },
  tuition_fees: {
    id: 'tuition_fees',
    message: 'Select a program to view fee details:',
    buttons: [
      { text: 'UG Program Fees', nextFlow: 'ug_fees' },
      { text: 'PG Program Fees', nextFlow: 'pg_fees' },
      { text: 'Other Fees', nextFlow: 'other_fees' },
      { text: 'Back to Fees', nextFlow: 'fees' }
    ]
  },
  infrastructure: {
    id: 'infrastructure',
    message: 'Our campus infrastructure includes:',
    buttons: [
      { text: 'Laboratories', nextFlow: 'labs' },
      { text: 'Library', nextFlow: 'library' },
      { text: 'Sports Facilities', nextFlow: 'sports' },
      { text: 'Back to Campus', nextFlow: 'campus' }
    ]
  },
  connect_agent: {
    id: 'connect_agent',
    message: 'Would you like to connect with a live agent for more detailed information?',
    buttons: [
      { text: 'Connect Now', nextFlow: 'agent_connect' },
      { text: 'Schedule Call', nextFlow: 'schedule_call' },
      { text: 'Email Support', nextFlow: 'email_support' },
      { text: 'Back to Main Menu', nextFlow: 'start' }
    ]
  }
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { message, currentFlow = 'start' } = body;

    // Handle user message to determine next flow
    let nextFlow: ChatFlow;

    if (message.toLowerCase().includes('connect') || message.toLowerCase().includes('agent')) {
      nextFlow = chatFlows.connect_agent;
    } else if (!chatFlows[currentFlow]) {
      nextFlow = chatFlows.start;
    } else {
      nextFlow = chatFlows[currentFlow];
    }

    return NextResponse.json(
      {
        response: nextFlow.message,
        buttons: nextFlow.buttons,
        currentFlow: nextFlow.id,
        success: true
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false
      },
      { status: 500 }
    );
  }
}
