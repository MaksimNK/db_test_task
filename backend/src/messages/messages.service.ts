import { Injectable } from '@nestjs/common';
import { ContainerService } from '../containers/containers.service';
import { Message } from './message';

@Injectable()
export class MessagesService {
  constructor(private readonly containerService: ContainerService) {}

  async addMessage(content: string): Promise<Message> {
    const client = this.containerService.getClient();

    if (!/^[a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(content)) {
      throw new Error('Message can only contain Latin letters, numbers, and standard symbols');
    }

    if (content.length > 10) {
      throw new Error('Message length cannot exceed 10 characters');
    }

    const existingMessage = await client.query(
      'SELECT id FROM messages WHERE content = $1',
      [content]
    );

    if (existingMessage.rows.length > 0) {
      throw new Error('Message must be unique');
    }

    await this.containerService.ensureContainerNotFull();
    const containerId = this.containerService.getCurrentContainerId();

    const result = await client.query<Message>(
      'INSERT INTO messages (content, container_id) VALUES ($1, $2) RETURNING *',
      [content, containerId]
    );

    return result.rows[0];
  }

  async searchMessage(content: string): Promise<Message | null> {
    const client = this.containerService.getClient();
    const result = await client.query<Message>(
      'SELECT * FROM messages WHERE content = $1',
      [content]
    );

    return result.rows[0] || null;
  }

  async getMessageCount(): Promise<number> {
    const client = this.containerService.getClient();
    const result = await client.query<{ count: string }>(
      'SELECT COUNT(*) FROM messages'
    );
    return parseInt(result.rows[0].count, 10);
  }
} 