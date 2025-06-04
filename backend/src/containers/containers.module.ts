import { Module } from '@nestjs/common';
import { ContainerService } from './containers.service';
import { ContainerController } from './containers.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContainerController],
  providers: [ContainerService],
  exports: [ContainerService],
})
export class ContainersModule {}
