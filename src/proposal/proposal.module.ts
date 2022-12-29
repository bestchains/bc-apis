import { Module } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { Proposal } from './models/proposal.model';
import { ProposalResolver } from './proposal.resolver';
import { ProposalService } from './proposal.service';

@Module({
  providers: [ProposalResolver, ProposalService],
})
export class ProposalModule {
  constructor(private readonly proposalService: ProposalService) {}

  @Query(() => [Proposal], { description: '提议列表' })
  async proposals(
    @Auth() auth: JwtAuth,
    @Args('type', { nullable: true }) type: string,
  ): Promise<Proposal[]> {
    return this.proposalService.getProposals(auth, type);
  }

  @Query(() => Proposal, { description: '提议详情' })
  async proposal(
    @Auth() auth: JwtAuth,
    @Args('name', { nullable: true }) name: string,
  ): Promise<Proposal> {
    return this.proposalService.getProposal(auth, name);
  }
}
