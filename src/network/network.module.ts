import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkResolver } from './network.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { NetworkLoader } from './network.loader';
import { FederationModule } from 'src/federation/federation.module';
import { IbppeerModule } from 'src/ibppeer/ibppeer.module';

@Module({
  providers: [NetworkService, NetworkResolver, NetworkLoader],
  exports: [NetworkLoader],
  imports: [ProposalModule, FederationModule, IbppeerModule], // TODO: 使用ChannelLoader后，去掉ChannelModule, IbppeerModule
})
export class NetworkModule {}
