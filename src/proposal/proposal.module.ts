import { Module } from '@nestjs/common';
import { OrganizationModule } from 'src/organization/organization.module';
import { VoteModule } from 'src/vote/vote.module';
import { ProposalResolver } from './proposal.resolver';
import { ProposalService } from './proposal.service';

@Module({
  providers: [ProposalResolver, ProposalService],
  exports: [ProposalService],
  imports: [VoteModule, OrganizationModule],
})
export class ProposalModule {}
