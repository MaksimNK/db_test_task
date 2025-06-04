import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ContainersModule } from '../containers/containers.module';

@Module({
  imports: [ContainersModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {} 