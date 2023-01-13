import { Module } from '@nestjs/common';
import { FederationService } from './federation.service';
import { FederationResolver } from './federation.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';

@Module({
  providers: [FederationResolver, FederationService],
  imports: [ProposalModule],
})
export class FederationModule {}
