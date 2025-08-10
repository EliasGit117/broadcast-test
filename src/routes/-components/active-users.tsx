import { useCollaborativeSessionContext } from '@/hooks/collaborative/provider';
import { ComponentProps, FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface IProps extends ComponentProps<'div'> {}

const ActiveUsers: FC<IProps> = ({ ...props }) => {
  const { activeUsers, currentUser } = useCollaborativeSessionContext();

  return (
      <Card {...props}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Users ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeUsers.map(user => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {currentUser.name}
                    {user.id === currentUser.id && ' (You)'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {activeUsers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No active users
            </p>
          )}
        </CardContent>
      </Card>
  )
}

export default ActiveUsers;