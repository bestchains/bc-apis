import { Module } from '@nestjs/common';
import { RealtimeLogGateway } from './realtime-log.gateway';

@Module({
  providers: [RealtimeLogGateway],
})
export class RealtimeLogModule {}
