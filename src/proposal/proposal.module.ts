import { Module } from '@nestjs/common';
import { ProposalResolver } from './proposal.resolver';
import { ProposalService } from './proposal.service';

@Module({
  providers: [ProposalResolver, ProposalService],
  exports: [ProposalService],
})
export class ProposalModule {}
