import { ComponentProps, FC } from 'react';
import { useCollaborativeSessionContext } from '@/hooks/collaborative/provider';
import { Button } from '@/components/ui/button';
import { Minus, MinusIcon, Plus, PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IProps extends ComponentProps<typeof Card> {

}

const SharedCounter: FC<IProps> = ({ className, ...props }) => {
  const { decrement, count, increment, users, lastClickedById } = useCollaborativeSessionContext();
  const user = !!lastClickedById ? users?.[lastClickedById] : undefined;

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <CardTitle>Shared Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{count}</div>
          {user && (
            <div className="text-sm text-muted-foreground mt-2">
              Last time modified by {user.name}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => decrement()} variant="outline" className="flex-1">
            <Minus className="h-4 w-4 mr-1" />
            Decrement
          </Button>
          <Button onClick={() => increment()} className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            Increment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedCounter;