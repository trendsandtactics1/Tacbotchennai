import { Button } from '@/components/ui/button';
import {
  Crown,
  MessageSquare,
  FileText,
  Newspaper,
  LucideIcon,
  Megaphone,
  Book
} from 'lucide-react';
import { useWidget } from '../../contexts/WidgetContext';

interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface ChatNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Crown, label: 'Home' },
  { id: 'messages', icon: MessageSquare, label: 'Message' },
  { id: 'complaint', icon: FileText, label: 'Enquiry' },
  { id: 'news', icon: Book, label: 'Info' },
  { id: 'articles', icon: Newspaper, label: 'Articles' }
];

export function ChatNavigation({ activeTab, onTabChange }: ChatNavigationProps) {
  const { setExpanded } = useWidget();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setExpanded(false); // Auto minimize when changing tabs
  };

  return (
    <div className="border-t p-2 flex justify-around">
      {navItems.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant={activeTab === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleTabChange(id)}
          className="flex flex-col gap-1 h-auto py-2"
        >
          <Icon className="h-5 w-5" />
          <span className="text-xs">{label}</span>
        </Button>
      ))}
    </div>
  );
}

export default ChatNavigation;
