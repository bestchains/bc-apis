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
import { ChannelService } from 'src/channel/channel.service';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { flattenArr } from 'src/common/utils';
import { FederationLoader } from 'src/federation/federation.loader';
import { Federation } from 'src/federation/models/federation.model';
import { Network } from 'src/network/models/network.model';
import { NetworkLoader } from 'src/network/network.loader';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { IbppeerService } from './ibppeer.service';
import { Ibppeer } from './models/ibppeer.model';

@Resolver(() => Ibppeer)
export class IbppeerResolver {
  constructor(
    private readonly ibppeerService: IbppeerService,
    private readonly channelService: ChannelService,
  ) {}

  @Query(() => [Ibppeer], { description: '获取组织下的节点列表' })
  async ibppeers(
    @Auth() auth: JwtAuth,
    @Args('organization', { description: '所在组织' }) org: string,
  ): Promise<Ibppeer[]> {
    return this.ibppeerService.getIbppeers(auth, org);
  }

  @Mutation(() => Ibppeer, { description: '创建IBPPeer节点' })
  async ibppeerCreate(
    @Auth() auth: JwtAuth,
    @Args('organization', { description: '所在组织' }) org: string,
  ): Promise<Ibppeer> {
    return this.ibppeerService.createIbppeer(auth, org);
  }

  @ResolveField(() => [String], {
    nullable: true,
    description: '节点加入的通道',
  })
  async channels(
    @Auth() auth: JwtAuth,
    @Parent() ibppeer: Ibppeer,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
    @Loader(FederationLoader)
    fedLoader: DataLoader<Federation['name'], Federation>,
    @Loader(NetworkLoader)
    networkLoader: DataLoader<Network['name'], Network>,
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
    // TODO: channelLoader
    const chans = await this.channelService.getChannelsByNames(
      auth,
      flattenArr(channelNames),
    );
    return chans
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
    @Auth() auth: JwtAuth,
    @Parent() ibppeer: Ibppeer,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
    @Loader(FederationLoader)
    fedLoader: DataLoader<Federation['name'], Federation>,
    @Loader(NetworkLoader)
    networkLoader: DataLoader<Network['name'], Network>,
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
    // TODO: channelLoader
    const chans = await this.channelService.getChannelsByNames(
      auth,
      flattenArr(channelNames),
    );
    const joinedChans = chans
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
}
