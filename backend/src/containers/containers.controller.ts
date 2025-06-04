import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
} from '@nestjs/common';
import { ContainerService } from './containers.service';
import { Container } from './container';

@Controller('/api/container')
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {}

  @Post('init')
  async init(
    @Body('capacity') capacity: number,
  ): Promise<{ success: boolean; message: string }> {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new HttpException('Capacity is not valid', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.containerService.initDatabase(capacity);
      return {
        success: true,
        message: 'Database was inited Successful',
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('current')
  getCurrent(): { containerId: number; capacity: number } {
    const containerId = this.containerService.getCurrentContainerId();
    const capacity = this.containerService.getCapacity();
    return { containerId, capacity };
  }

  @Get('all')
  async getAllContainers(): Promise<Container[]> {
    try {
      const containers = await this.containerService.getAllContainers();
      return containers;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(msg, HttpStatus.BAD_REQUEST);
    }
  }
}
