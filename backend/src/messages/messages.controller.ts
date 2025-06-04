import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message';

@Controller('/api/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('add')
  async addMessage(
    @Body('content') content: string,
  ): Promise<{ success: boolean; message: Message }> {
    try {
      const message = await this.messagesService.addMessage(content);
      return {
        success: true,
        message,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('search')
  async searchMessage(
    @Body('content') content: string,
  ): Promise<{ success: boolean; message: Message | null }> {
    try {
      const message = await this.messagesService.searchMessage(content);
      return {
        success: true,
        message,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('count')
  async getMessageCount(): Promise<{ count: number }> {
    try {
      const count = await this.messagesService.getMessageCount();
      return { count };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }
} 