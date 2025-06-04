import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContainersModule } from './containers/containers.module';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [ContainersModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
