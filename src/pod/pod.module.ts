import { Module } from '@nestjs/common';
import { PodService } from './pod.service';

@Module({
  providers: [PodService],
  exports: [PodService],
})
export class PodModule {}
