import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { UpdateVote } from './dto/update-vote.input';
import { Vote } from './models/vote.model';
import { VoteService } from './vote.service';

@Resolver(() => Vote)
export class VoteResolver {
  constructor(private readonly voteService: VoteService) {}

  @Mutation(() => Vote, { description: '更新投票' })
  async voteUpdate(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('organization') namespace: string,
    @Args('vote') vote: UpdateVote,
  ): Promise<Vote> {
    return this.voteService.updateVote(auth, name, namespace, vote);
  }

  @ResolveField(() => String, { description: '投票人（组织中）' })
  async organizationAdmin(
    @Parent() vote: Vote,
    @Loader(OrganizationLoader)
    orgLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<string> {
    const { organizationName } = vote;
    const org = await orgLoader.load(organizationName);
    return org.admin;
  }
}
