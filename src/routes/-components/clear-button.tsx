import { ComponentProps, FC } from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { useCollaborativeSessionContext } from '@/hooks/collaborative/provider';


interface IProps extends ComponentProps<typeof Button> {}

export const ClearButton: FC<IProps> = ({ ...props }) => {
  const { resetUsers, resetChat, resetCounter } = useCollaborativeSessionContext();

  const reset = () => {
    resetUsers();
    resetChat();
    resetCounter();
  }

  return (
    <Button variant='ghost' size={'icon'} onClick={reset} {...props}>
      <TrashIcon/>
    </Button>
  )
}