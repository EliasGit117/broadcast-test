import { TTabUserSchema } from '@/hooks/collaborative/types';
import { v4 as uuidv4 } from 'uuid';

const userId = uuidv4();

export const user: TTabUserSchema = {
  id: userId,
  name: `User-${userId.slice(0, 4)}`
};