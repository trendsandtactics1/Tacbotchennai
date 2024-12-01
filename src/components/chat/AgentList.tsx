import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

interface AgentListProps {
  agents: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  onConnectAgent: (agentId: string) => void;
}

export default function AgentList({ agents, onConnectAgent }: AgentListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 font-medium">No agents available</p>
            <p className="text-gray-400 text-sm mt-1">
              Please try again later
            </p>
          </div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <p className="text-sm text-gray-500">Customer Service</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    agent.status === 'online'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {agent.status}
                </Badge>
              </div>
              <Button
                onClick={() => onConnectAgent(agent.id)}
                className="w-full"
                variant="outline"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Complaint
              </Button>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
