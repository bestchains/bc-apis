import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelResolver } from './channel.resolver';
import { ChannelLoader } from './channel.loader';

@Module({
  providers: [ChannelService, ChannelResolver, ChannelLoader],
  exports: [ChannelLoader],
})
export class ChannelModule {}
