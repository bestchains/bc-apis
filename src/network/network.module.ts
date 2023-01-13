import { Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkResolver } from './network.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { NetworkLoader } from './network.loader';

@Module({
  providers: [NetworkService, NetworkResolver, NetworkLoader],
  exports: [NetworkLoader],
  imports: [ProposalModule],
})
export class NetworkModule {}
