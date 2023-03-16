import { forwardRef, Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelResolver } from './channel.resolver';
import { ChannelLoader } from './channel.loader';
import { EpolicyModule } from 'src/epolicy/epolicy.module';
import { ChaincodeModule } from 'src/chaincode/chaincode.module';

@Module({
  providers: [ChannelService, ChannelResolver, ChannelLoader],
  exports: [ChannelLoader, ChannelService],
  imports: [forwardRef(() => EpolicyModule), forwardRef(() => ChaincodeModule)],
})
export class ChannelModule {}
