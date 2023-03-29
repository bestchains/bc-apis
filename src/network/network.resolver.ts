import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Chaincode } from 'src/chaincode/models/chaincode.model';
import { ChannelLoader } from 'src/channel/channel.loader';
import { Channel } from 'src/channel/models/channel.model';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { flattenArr, NETWORK_VERSION_RESOURCES } from 'src/common/utils';
import { IbppeerService } from 'src/ibppeer/ibppeer.service';
import { Ibppeer } from 'src/ibppeer/models/ibppeer.model';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { NewNetworkInput } from './dto/new-network.input';
import { OrderVersion } from './dto/order-version.enum';
import { Network } from './models/network.model';
import { NetworkService } from './network.service';

@Resolver(() => Network)
export class NetworkResolver {
  constructor(
    private readonly networkService: NetworkService,
    private readonly peerService: IbppeerService,
  ) {}

  @Query(() => [Network], { description: '网络列表' })
  async networks(@Auth() auth: JwtAuth): Promise<Network[]> {
    return this.networkService.getNetworks(auth);
  }

  @Query(() => Network, { description: '网络详情' })
  async network(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<Network> {
    return this.networkService.getNetwork(auth, name);
  }

  @Mutation(() => Network, { description: '创建网络' })
  async networkCreate(
    @Auth() auth: JwtAuth,
    @Args('network') network: NewNetworkInput,
  ): Promise<Network> {
    return this.networkService.createNetwork(auth, network);
  }

  @Mutation(() => Boolean, {
    description:
      '释放网络（返回true：只表示这个操作触发成功，而不是释放网络成功）',
  })
  async networkDissolve(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('federation', { description: '所属联盟' }) federation: string,
    @Args('initiator', { description: '网络发起者（组织）' }) initiator: string,
  ): Promise<boolean> {
    return this.networkService.dissolveNetwork(
      auth,
      name,
      federation,
      initiator,
    );
  }

  @Mutation(() => K8sV1Status, { description: '删除网络' })
  async networkDelete(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<K8sV1Status> {
    return this.networkService.deleteNetwork(auth, name);
  }

  @ResolveField(() => OrderVersion, { nullable: true, description: '配置版本' })
  version(@Parent() network: Network): OrderVersion {
    const { storage } = network;
    if (NETWORK_VERSION_RESOURCES[OrderVersion.Enterprise][4] === storage) {
      return OrderVersion.Enterprise;
    }
    if (NETWORK_VERSION_RESOURCES[OrderVersion.Finance][4] === storage) {
      return OrderVersion.Finance;
    }
    if (NETWORK_VERSION_RESOURCES[OrderVersion.Standard][4] === storage) {
      return OrderVersion.Standard;
    }
    return null;
  }

  @ResolveField(() => [Organization], { description: '组织' })
  async organizations(
    @Parent() network: Network,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<Organization[]> {
    const { members } = network;
    if (!members) return [];
    const orgs = await organizationLoader.loadMany(
      members.map((member) => member.name),
    );
    return orgs as Organization[];
  }

  @ResolveField(() => Organization, {
    nullable: true,
    description: '网络发起者（组织）',
  })
  async initiator(
    @Parent() network: Network,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<Organization> {
    const { initiatorName } = network;
    if (!initiatorName) return;
    const org = await organizationLoader.load(initiatorName);
    return org;
  }

  @ResolveField(() => [Channel], { nullable: true, description: '通道列表' })
  async channels(
    @Parent() network: Network,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<Channel[]> {
    const { channelNames } = network;
    if (!channelNames || channelNames.length === 0) return;
    const cs = await channelLoader.loadMany(channelNames);
    return cs;
  }

  @ResolveField(() => [Ibppeer], {
    nullable: true,
    description: '网络中的所有节点',
  })
  async peers(
    @Auth() auth: JwtAuth,
    @Parent() network: Network,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<Ibppeer[]> {
    const { channelNames } = network;
    if (!channelNames || channelNames.length === 0) return;
    const channels = await channelLoader.loadMany(channelNames);
    const peerses = (channels as Channel[])?.map((channel) => channel.peers);
    const peers = flattenArr(peerses);
    // TODO: IbppeerLoader, 以namespace/name为key
    return Promise.all(
      peers?.map((peer) =>
        this.peerService
          .getIbppeer(auth, peer.namespace, peer.name)
          .catch(() => peer),
      ),
    );
  }

  @ResolveField(() => [Chaincode], {
    nullable: true,
    description: '智能合约',
  })
  async chaincode(
    @Auth() auth: JwtAuth,
    @Parent() network: Network,
  ): Promise<Chaincode[]> {
    const { name } = network;
    return this.networkService.getResolveFieldChaincode(auth, name);
  }
}
