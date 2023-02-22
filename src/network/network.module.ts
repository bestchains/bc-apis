import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkResolver } from './network.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { NetworkLoader } from './network.loader';
import { FederationModule } from 'src/federation/federation.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  providers: [NetworkService, NetworkResolver, NetworkLoader],
  exports: [NetworkLoader],
  imports: [ProposalModule, FederationModule, ChannelModule], // TODO: 使用ChannelLoader后，去掉ChannelModule
})
export class NetworkModule {}
