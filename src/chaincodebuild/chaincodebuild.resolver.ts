import { forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { ChaincodeService } from 'src/chaincode/chaincode.service';
import { Chaincode } from 'src/chaincode/models/chaincode.model';
import { ChannelLoader } from 'src/channel/channel.loader';
import { Channel } from 'src/channel/models/channel.model';
import { SpecPeer } from 'src/channel/models/spec-peer.model';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { ChaincodebuildService } from './chaincodebuild.service';
import { NewChaincodebuild } from './dto/new-chaincodebuild.input';
import { UpgradeChaincodebuild } from './dto/upgrade-chaincodebuild.input';
import { Chaincodebuild } from './models/chaincodebuild.model';

@Resolver(() => Chaincodebuild)
export class ChaincodebuildResolver {
  constructor(
    private readonly ccbService: ChaincodebuildService,
    @Inject(forwardRef(() => ChaincodeService))
    private readonly chaincodeService: ChaincodeService,
  ) {}

  @Query(() => [Chaincodebuild], { description: '合约列表' })
  async chaincodebuilds(
    @Auth() auth: JwtAuth,
    @Args('network', { description: '此合约所在网络' }) network: string,
    @Args('displayName', { nullable: true, description: '此合约的名称' })
    id: string,
    @Args('version', { nullable: true, description: '此合约的版本' })
    version: string,
  ): Promise<Chaincodebuild[]> {
    return this.ccbService.getChaincodebuilds(auth, { network, id, version });
  }

  @Query(() => Chaincodebuild, { description: '合约详情' })
  async chaincodebuild(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<Chaincodebuild> {
    return this.ccbService.getChaincodebuild(auth, name);
  }

  @Mutation(() => Chaincodebuild, { description: '创建合约' })
  async chaincodebuildCreate(
    @Auth() auth: JwtAuth,
    @Args('chaincodebuild') chaincodebuild: NewChaincodebuild,
  ): Promise<Chaincodebuild> {
    return this.ccbService.createChaincodebuild(auth, chaincodebuild);
  }

  @Mutation(() => Chaincodebuild, { description: '升级合约' })
  async chaincodebuildUpgrade(
    @Auth() auth: JwtAuth,
    @Args('chaincodebuild') chaincodebuild: UpgradeChaincodebuild,
  ): Promise<Chaincodebuild> {
    return this.ccbService.upgradeChaincodebuild(auth, chaincodebuild);
  }

  @Mutation(() => K8sV1Status, { description: '删除合约' })
  async chaincodebuildDelete(
    @Auth() auth: JwtAuth,
    @Args('name', { description: '合约name' })
    name: string,
  ): Promise<K8sV1Status> {
    return this.ccbService.deleteChaincodebuild(auth, name);
  }

  @ResolveField(() => [Organization], { description: '组织' })
  async organizations(
    @Parent() ccb: Chaincodebuild,
    @Loader(OrganizationLoader)
    orgLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<Organization[]> {
    // TODO: ?
    const { initiator } = ccb;
    const org = await orgLoader.load(initiator);
    return [org];
  }

  @ResolveField(() => [Channel], { description: '通道' })
  async channels(
    @Auth() auth: JwtAuth,
    @Parent() ccb: Chaincodebuild,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<Channel[]> {
    const { displayName, version } = ccb;
    // TODO: 优化Dataloader
    const ccs = await this.chaincodeService.getChaincodes(auth, {
      id: displayName,
      version,
    });
    const channelNames = (ccs as Chaincode[])?.map((cc) => cc.channel);
    const channels = await channelLoader.loadMany(channelNames);
    return channels as Channel[];
  }

  @ResolveField(() => [SpecPeer], { description: '节点' })
  async ibppeers(
    @Auth() auth: JwtAuth,
    @Parent() ccb: Chaincodebuild,
    @Loader(ChannelLoader) channelLoader: DataLoader<Channel['name'], Channel>,
  ): Promise<SpecPeer[]> {
    // TODO: 还不支持选择节点，暂时为channel的所有节点
    const { displayName, version } = ccb;
    const ccs = await this.chaincodeService.getChaincodes(auth, {
      id: displayName,
      version,
    });
    const channelNames = (ccs as Chaincode[])?.map((cc) => cc.channel);
    const channels = await channelLoader.loadMany(channelNames);
    const peers = [];
    for (const c of channels as Channel[]) {
      peers.concat(c?.peers);
    }
    return peers;
  }
}
