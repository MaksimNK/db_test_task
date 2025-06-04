import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  private adminClient!: Client;

  async createAndInitDatabase(): Promise<Client> {
    this.adminClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'postgres',
    });
    await this.adminClient.connect();

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dbName = `${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(
      now.getHours(),
    )}_${pad(now.getMinutes())}_${pad(now.getSeconds())}`;

    await this.adminClient.query(`CREATE DATABASE "${dbName}"`);
    await this.adminClient.end();

    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName,
    });
    await client.connect();

    await client.query(`
      CREATE TABLE containers (
        id SERIAL PRIMARY KEY
      );
    `);

    await client.query(`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        content VARCHAR(10) UNIQUE NOT NULL,
        container_id INTEGER NOT NULL REFERENCES containers(id)
      );
    `);

    await client.query('INSERT INTO containers DEFAULT VALUES');
    return client;
  }
}
