import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { VotePhase } from 'src/vote/models/vote-phase.enum';
import { ProposalPhase } from './models/proposal-phase.enum';
import { ProposalStatus } from './models/proposal-status.enum';
import { ProposalType } from './models/proposal-type.enum';
import { Proposal } from './models/proposal.model';
import { ProposalService } from './proposal.service';

@Resolver(() => Proposal)
export class ProposalResolver {
  constructor(private readonly proposalService: ProposalService) {}

  @Query(() => [Proposal], { description: '提议列表' })
  async proposals(
    @Auth() auth: JwtAuth,
    @Args('type', {
      type: () => ProposalType,
      nullable: true,
      description: '根据类型检索',
    })
    type: ProposalType,
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

  @ResolveField(() => String, {
    nullable: true,
    description: '当前用户所在组织的投票状态',
  })
  async voted(
    @Auth() auth: JwtAuth,
    @Parent() pro: Proposal,
    @Loader(OrganizationLoader)
    orgLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<string> {
    const { votes } = pro;
    const { preferred_username } = auth;
    if (!votes) return;
    const orgs = await orgLoader.loadMany(votes.map((v) => v.organizationName));
    const orgsMap = new Map(
      (orgs as Organization[]).map((org) => [org?.name, org?.admin]),
    );
    const vote = votes?.find(
      (v) => orgsMap.get(v.organizationName) === preferred_username,
    );
    return vote?.status || VotePhase.NotVoted;
  }

  @ResolveField(() => ProposalStatus, { description: '当前状态' })
  status(@Parent() pro: Proposal): string {
    const { statusConfitionType, statusPhase } = pro;
    if (statusPhase === ProposalPhase.Finished) {
      return statusConfitionType;
    }
    return statusPhase;
  }

  @ResolveField(() => Organization, {
    nullable: true,
    description: '发起者（组织）',
  })
  async initiator(
    @Parent() pro: Proposal,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<Organization> {
    const { initiatorName } = pro;
    if (!initiatorName) return;
    const org = await organizationLoader.load(initiatorName);
    return org;
  }
}
