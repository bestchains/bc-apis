import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { find } from 'lodash';
import { ChannelLoader } from 'src/channel/channel.loader';
import { Channel } from 'src/channel/models/channel.model';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { flattenArr } from 'src/common/utils';
import { FederationLoader } from 'src/federation/federation.loader';
import { Federation } from 'src/federation/models/federation.model';
import { Network } from 'src/network/models/network.model';
import { NetworkLoader } from 'src/network/network.loader';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { Pod } from 'src/pod/models/pod.model';
import { PodService } from 'src/pod/pod.service';
import { JwtAuth } from 'src/types';
import { IbppeerService } from './ibppeer.service';
import { Ibppeer } from './models/ibppeer.model';

@Resolver(() => Ibppeer)
export class IbppeerResolver {
  constructor(
    private readonly ibppeerService: IbppeerService,
    private readonly podService: PodService,
  ) {}

  @Query(() => [Ibppeer], { description: '获取组织下的节点列表' })
  async ibppeers(
    @Auth() auth: JwtAuth,
    @Args('organization', { description: '所在组织' }) org: string,
  ): Promise<Ibppeer[]> {
    return this.ibppeerService.getIbppeers(auth, org);
  }

  @Mutation(() => [Ibppeer], { description: '创建IBPPeer节点' })
  async ibppeerCreate(
    @Auth() auth: JwtAuth,
    @Args('organization', { description: '所在组织' }) org: string,
    @Args('count', { description: '新增节点数', nullable: true }) count: number,
  ): Promise<Ibppeer[]> {
    return this.ibppeerService.createIbppeers(auth, org, count);
  }

  @ResolveField(() => [String], {
    nullable: true,
    description: '节点加入的通道',
  })
  async channels(
    @Parent() ibppeer: Ibppeer,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
    @Loader(FederationLoader)
    fedLoader: DataLoader<Federation['name'], Federation>,
    @Loader(NetworkLoader)
    networkLoader: DataLoader<Network['name'], Network>,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<string[]> {
    // org -> fed -> net -> chan -> peers => chan
    const { namespace, name } = ibppeer;
    const { federations } = await organizationLoader.load(namespace);
    if (!federations || federations.length === 0) return;
    const feds = await fedLoader.loadMany(federations);
    const networkNames = (feds as Federation[]).map((fed) => fed?.networkNames);
    if (!networkNames || networkNames.length === 0) return;
    const nets = await networkLoader.loadMany(flattenArr(networkNames));
    const channelNames = (nets as Network[]).map((net) => net.channelNames);
    const chans = await channelLoader.loadMany(flattenArr(channelNames));
    return (chans as Channel[])
      ?.filter((chan) =>
        chan?.peers?.find((p) => p.name === name && p.namespace === namespace),
      )
      ?.map((chan) => chan.name);
  }

  // TODO: 优化合并？
  @ResolveField(() => [String], {
    nullable: true,
    description: '节点加入的网络',
  })
  async networks(
    @Parent() ibppeer: Ibppeer,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
    @Loader(FederationLoader)
    fedLoader: DataLoader<Federation['name'], Federation>,
    @Loader(NetworkLoader)
    networkLoader: DataLoader<Network['name'], Network>,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<string[]> {
    // org -> fed -> net -> chan -> peers => chan => net
    const { namespace, name } = ibppeer;
    const { federations } = await organizationLoader.load(namespace);
    if (!federations || federations.length === 0) return;
    const feds = await fedLoader.loadMany(federations);
    const networkNames = (feds as Federation[]).map((fed) => fed?.networkNames);
    if (!networkNames || networkNames.length === 0) return;
    const nets = await networkLoader.loadMany(flattenArr(networkNames));
    const channelNames = (nets as Network[]).map((net) => net.channelNames);
    const chans = await channelLoader.loadMany(flattenArr(channelNames));
    const joinedChans = (chans as Channel[])
      ?.filter((chan) =>
        chan?.peers?.find((p) => p.name === name && p.namespace === namespace),
      )
      ?.map((chan) => chan.name);
    return (nets as Network[])
      ?.filter((net) => find(net.channelNames, (o) => joinedChans.includes(o)))
      ?.map((net) => net.name);
  }

  @ResolveField(() => Boolean, {
    description: '是否为我创建的',
  })
  async createdByMe(
    @Auth() auth: JwtAuth,
    @Parent() ibppeer: Ibppeer,
  ): Promise<boolean> {
    const { preferred_username } = auth;
    const { enrolluser } = ibppeer;
    return enrolluser === preferred_username;
  }

  @ResolveField(() => Pod, {
    description: '获取节点实时日志所需要的信息',
  })
  async pod(@Auth() auth: JwtAuth, @Parent() ibppeer: Ibppeer): Promise<Pod> {
    const { name, namespace } = ibppeer;
    const pods = await this.podService.getPods(auth, namespace, { app: name });
    return pods[0];
  }
}
