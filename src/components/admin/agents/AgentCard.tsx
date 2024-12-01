import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  MoreVertical,
  Shield,
  ShieldAlert,
  Trash2,
  User,
  UserCog,
  Pencil
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Agent {
  id: string;
  name: string;
  status: string;
  is_admin: boolean;
  avatar_url?: string;
  role?: string;
  last_active?: string;
}

interface AgentCardProps {
  agent: Agent;
  onToggleAdmin: (agent: Agent) => void;
  onDelete: (id: string) => void;
}

export function AgentCard({ agent, onToggleAdmin, onDelete }: AgentCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            {agent.avatar_url ? (
              <AvatarImage src={agent.avatar_url} alt={agent.name} />
            ) : (
              <AvatarFallback className="bg-primary/10">
                {agent.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{agent.name}</h3>
              {agent.is_admin && (
                <Badge variant="secondary" className="font-normal">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={agent.status === 'online' ? 'success' : 'secondary'}
                className="font-normal"
              >
                {agent.status === 'online' ? (
                  <>
                    <span className="relative flex h-2 w-2 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 mr-1.5 rounded-full bg-gray-400" />
                    Offline
                  </>
                )}
              </Badge>
              {agent.role && (
                <Badge variant="outline" className="font-normal">
                  <UserCog className="h-3 w-3 mr-1" />
                  {agent.role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => navigate(`/admin/agents/edit/${agent.id}`)}
              className="cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Agent
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleAdmin(agent)}
              className="cursor-pointer"
            >
              {agent.is_admin ? (
                <>
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Remove Admin
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Make Admin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(agent.id)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Agent
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Admin Access</span>
          </div>
          <Switch
            checked={agent.is_admin}
            onCheckedChange={() => onToggleAdmin(agent)}
          />
        </div>
        {agent.last_active && (
          <p className="text-sm text-gray-500">
            Last active: {new Date(agent.last_active).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}