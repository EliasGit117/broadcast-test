import { FC, FormEvent, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useCollaborativeSessionContext } from '@/hooks/collaborative/provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const formatTime = (timestamp: number) => format(new Date(timestamp), 'HH:mm:ss');

const Chat: FC = () => {
  const {
    messages,
    sendMessage,
    deleteMessage,
    markTyping,
    typingUsers,
    currentUser,
    users,
  } = useCollaborativeSessionContext();

  const [messageText, setMessageText] = useState('');
  const [expiration, setExpiration] = useState<number | undefined>(undefined); // Expiration in seconds
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText, expiration ? expiration / 60 : undefined); // Convert seconds to minutes for the hook
      setMessageText('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    markTyping(true);
  };

  const getUserName = (userId: string) => {
    if (userId === currentUser.id) return 'You'; // Current user
    return users[userId]?.name || `User-${userId.slice(0, 4)}`; // Fallback to userId if name is unavailable
  };

  const getUserAvatar = (userId: string) => {
    return users[userId]?.name?.[0]?.toUpperCase() || userId[0]?.toUpperCase(); // First letter of the user's name or userId
  };

  return (
    <Card className={cn('flex flex-col h-[500px]')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat
          {typingUsers.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {typingUsers.length === 1
                ? `${getUserName(typingUsers[0].userId)} is typing...`
                : `${typingUsers.length} users are typing...`}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 pb-0">
        {messages.map((message) => {
          const isCurrentUser = message.userId === currentUser.id; // Check if the message is from the current user

          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 max-w-[80%]',
                isCurrentUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>{getUserAvatar(message.userId)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {isCurrentUser ? 'You' : getUserName(message.userId)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div
                  className={cn(
                    'rounded-lg py-2 px-3',
                    isCurrentUser
                      ? 'bg-primary text-primary-foreground' // Style for the current user's messages
                      : 'bg-muted' // Style for other users' messages
                  )}
                >
                  {message.text}
                </div>
                {isCurrentUser && (
                  <div className="flex justify-end mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={messageText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {expiration ? `${expiration} sec` : 'Expiration'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Set Expiration</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setExpiration(undefined)}>
                No Expiration
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpiration(10)}>
                10 Seconds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpiration(30)}>
                30 Seconds
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpiration(60)}>
                1 Minute
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpiration(300)}>
                5 Minutes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpiration(600)}>
                10 Minutes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExpiration(1800)}>
                30 Minutes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default Chat;