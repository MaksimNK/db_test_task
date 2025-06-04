import { Message } from 'src/messages/message';

export interface Container {
  id: number;
  capacity: number;
  messages: Message[];
}
