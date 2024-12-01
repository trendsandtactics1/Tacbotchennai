import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { MessageSquare, Users, AlertCircle, Newspaper } from 'lucide-react';

// Sample data - replace with your actual data
const conversationData = [
  { name: 'Mon', conversations: 4 },
  { name: 'Tue', conversations: 3 },
  { name: 'Wed', conversations: 6 },
  { name: 'Thu', conversations: 8 },
  { name: 'Fri', conversations: 7 },
  { name: 'Sat', conversations: 5 },
  { name: 'Sun', conversations: 4 }
];

const complaintData = [
  { name: 'Jan', complaints: 20 },
  { name: 'Feb', complaints: 15 },
  { name: 'Mar', complaints: 25 },
  { name: 'Apr', complaints: 18 },
  { name: 'May', complaints: 22 },
  { name: 'Jun', complaints: 30 }
];

export default function Dashboard() {
  const stats = {
    totalConversations: 245,
    activeAnnouncements: 8,
    totalComplaints: 32
  };

  return (
    <div className='space-y-6 mt-16'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <MessageSquare className='h-6 w-6 text-blue-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-500'>
                Total Conversations
              </h3>
              <p className='text-2xl font-bold'>{stats.totalConversations}</p>
            </div>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='p-2 bg-purple-100 rounded-lg'>
              <Newspaper className='h-6 w-6 text-purple-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-500'>
                Active Announcements
              </h3>
              <p className='text-2xl font-bold'>{stats.activeAnnouncements}</p>
            </div>
          </div>
        </Card>

        <Card className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='p-2 bg-orange-100 rounded-lg'>
              <AlertCircle className='h-6 w-6 text-orange-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-500'>Total Complaints</h3>
              <p className='text-2xl font-bold'>{stats.totalComplaints}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Weekly Conversations Chart */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Weekly Conversations</h3>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={conversationData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey='conversations'
                  fill='#3b82f6'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Complaints Chart */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Monthly Complaints</h3>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={complaintData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='complaints'
                  stroke='#8b5cf6'
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
