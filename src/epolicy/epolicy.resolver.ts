import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { ChannelLoader } from 'src/channel/channel.loader';
import { Channel } from 'src/channel/models/channel.model';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { JwtAuth } from 'src/types';
import { NewEpolicyInput } from './dto/new-epolicy.input';
import { EpolicyService } from './epolicy.service';
import { Epolicy } from './models/epolicy.model';

@Resolver(() => Epolicy)
export class EpolicyResolver {
  constructor(private readonly epolicyService: EpolicyService) {}

  @Query(() => [Epolicy], { description: '策略列表' })
  async epolicies(
    @Auth() auth: JwtAuth,
    @Args('network', { nullable: true }) network: string,
  ): Promise<Epolicy[]> {
    return this.epolicyService.getEpolicies(auth, network);
  }

  @Mutation(() => Epolicy, { description: '创建策略' })
  async epolicyCreate(
    @Auth() auth: JwtAuth,
    @Args('epolicy') epolicy: NewEpolicyInput,
  ): Promise<Epolicy> {
    return this.epolicyService.createEpolicy(auth, epolicy);
  }

  @Mutation(() => K8sV1Status, { description: '删除策略' })
  async epolicyDelete(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<K8sV1Status> {
    return this.epolicyService.deleteEpolicy(auth, name);
  }

  @Query(() => [Channel], {
    description: '创建策略时，可选的通道',
  })
  async channelsForCreateEpolicy(
    @Auth() auth: JwtAuth,
    @Args('network') network: string,
  ): Promise<Channel[]> {
    return this.epolicyService.getChannelsForCreateEpolicy(auth, network);
  }

  @ResolveField(() => String, {
    nullable: true,
    description: '所在通道名称(displayName)',
  })
  async channelDisplayName(
    @Parent() epolicy: Epolicy,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<string> {
    const { channel } = epolicy;
    const chan = await channelLoader.load(channel);
    return chan?.displayName;
  }
}
