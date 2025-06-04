import { Injectable } from '@nestjs/common';
import { Client, QueryResult } from 'pg';
import { DatabaseService } from '../database/database.service';
import { Message } from 'src/messages/message';
import { Container } from './container';

@Injectable()
export class ContainerService {
  private client!: Client;
  private containerId!: number;
  private capacity!: number;

  constructor(private readonly databaseService: DatabaseService) {}

  async initDatabase(capacity: number): Promise<void> {
    this.capacity = capacity;
    this.client = await this.databaseService.createAndInitDatabase();

    const res: QueryResult<{ id: number }> = await this.client.query(
      'SELECT id FROM containers ORDER BY id DESC LIMIT 1',
    );
    this.containerId = res.rows[0].id;
  }

  getCurrentContainerId(): number {
    return this.containerId;
  }

  getCapacity(): number {
    return this.capacity;
  }

  async ensureContainerNotFull(): Promise<void> {
    const countRes: QueryResult<{ count: string }> = await this.client.query(
      'SELECT COUNT(*) FROM messages WHERE container_id = $1',
      [this.containerId],
    );
    const messageCount = parseInt(countRes.rows[0].count, 10);

    if (messageCount >= this.capacity) {
      const newContainerRes: QueryResult<{ id: number }> =
        await this.client.query(
          'INSERT INTO containers DEFAULT VALUES RETURNING id',
        );
      this.containerId = newContainerRes.rows[0].id;
    }
  }

  getClient(): Client {
    return this.client;
  }

  async getAllContainers(): Promise<Container[]> {
    const result = await this.client.query<{
      container_id_alias: number;
      message_id: number | null;
      content: string | null;
      container_id_fk: number | null;
    }>(`
    SELECT 
      c.id as container_id_alias, 
      m.id as message_id, 
      m.content, 
      m.container_id as container_id_fk
    FROM containers c
    LEFT JOIN messages m ON c.id = m.container_id
    ORDER BY c.id ASC
  `);

    const containersMap = new Map<number, Container>();

    for (const row of result.rows) {
      const containerId = row.container_id_alias;

      if (!containersMap.has(containerId)) {
        containersMap.set(containerId, {
          id: containerId,
          capacity: this.capacity,
          messages: [],
        });
      }

      if (
        row.message_id !== null &&
        row.content !== null &&
        row.container_id_fk !== null
      ) {
        const message: Message = {
          id: row.message_id,
          content: row.content,
          container_id: row.container_id_fk,
        };

        containersMap.get(containerId)!.messages.push(message);
      }
    }

    return Array.from(containersMap.values());
  }
}
