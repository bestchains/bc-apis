import { forwardRef, Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelResolver } from './channel.resolver';
import { ChannelLoader } from './channel.loader';
import { EpolicyModule } from 'src/epolicy/epolicy.module';

@Module({
  providers: [ChannelService, ChannelResolver, ChannelLoader],
  exports: [ChannelLoader, ChannelService],
  imports: [forwardRef(() => EpolicyModule)],
})
export class ChannelModule {}
