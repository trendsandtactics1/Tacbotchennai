import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Conversations from './pages/admin/Conversations';
import Announcements from './pages/admin/Announcements';
import CreateAnnouncement from './pages/admin/CreateAnnouncement';
import EditAnnouncement from './pages/admin/EditAnnouncement';
import Complaints from './pages/admin/Complaints';
import Login from './pages/admin/Login';
import WebsiteContent from './components/admin/WebsiteContent';
import ConversationDetails from './components/admin/conversations/ConversationDetails';
import ChatWidget from './pages/ChatWidget';
import Articles from './pages/admin/Articles';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='/widget' element={<ChatWidget />} />
          <Route path='/admin' element={<AdminLayout />}>
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='conversations' element={<Conversations />} />
            <Route path='conversations/:id' element={<ConversationDetails />} />
            <Route path='announcements' element={<Announcements />} />
            <Route path='announcements/create' element={<CreateAnnouncement />} />
            <Route path='announcements/edit/:id' element={<EditAnnouncement />} />
            <Route path='complaints' element={<Complaints />} />
            <Route path='website-content' element={<WebsiteContent />} />
            <Route path='articles' element={<Articles />} />
          </Route>
          <Route path='/admin/login' element={<Login />} />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
    </>
  );
}

export default App;
