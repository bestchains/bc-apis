import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { JwtAuth } from 'src/types';
import { ChaincodebuildService } from './chaincodebuild.service';
import { NewChaincodebuild } from './dto/new-chaincodebuild.input';
import { UpgradeChaincodebuild } from './dto/upgrade-chaincodebuild.input';
import { Chaincodebuild } from './models/chaincodebuild.model';

@Resolver()
export class ChaincodebuildResolver {
  constructor(private readonly ccbService: ChaincodebuildService) {}

  @Query(() => [Chaincodebuild], { description: '合约列表' })
  async chaincodebuilds(
    @Auth() auth: JwtAuth,
    @Args('network', { description: '此合约所在网络' }) network: string,
  ): Promise<Chaincodebuild[]> {
    return this.ccbService.getChaincodebuilds(auth, { network });
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

  @Mutation(() => [K8sV1Status], { description: '删除合约' })
  async chaincodebuildDelete(
    @Auth() auth: JwtAuth,
    @Args('displayName', { description: '合约名称（displayName, 非name）' })
    displayName: string,
    @Args('network', { description: '此合约所在网络' }) network: string,
  ): Promise<K8sV1Status[]> {
    return this.ccbService.deleteChaincodebuild(auth, displayName, network);
  }
}
