import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, MessageSquare, Bell, Settings } from "lucide-react";

const ChatHelp = () => {
  const helpItems = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Chat Interface",
      description: "Start a conversation with our AI assistant or connect with a live agent for personalized support."
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: "Announcements",
      description: "Stay updated with our latest news, updates, and important information."
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Quick Tips",
      description: "Get the most out of our chat by using clear, concise messages and reviewing your chat history."
    }
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        <div className="text-center mb-8">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-semibold mb-2">How can we help?</h2>
          <p className="text-gray-500">Find quick answers and learn how to make the most of our chat service</p>
        </div>

        <div className="space-y-4">
          {helpItems.map((item, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-blue-500">{item.icon}</div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Need More Help?</h3>
          <p className="text-gray-600 text-sm">
            If you can't find what you're looking for, start a chat with our AI assistant or connect with a live agent for personalized support.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ChatHelp;