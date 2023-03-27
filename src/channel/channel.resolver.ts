import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { DataLoader } from 'src/common/dataloader/DataLoader';
import { ChaincodeLoader } from 'src/chaincode/chaincode.loader';
import { Chaincode } from 'src/chaincode/models/chaincode.model';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { decodeBase64 } from 'src/common/utils';
import { ConfigmapService } from 'src/configmap/configmap.service';
import { Epolicy } from 'src/epolicy/models/epolicy.model';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { ChannelService } from './channel.service';
import { NewChannel } from './dto/new-channel.input';
import { UpdateChannel } from './dto/update-channel.input';
import { Channel } from './models/channel.model';
import { EpolicyLoader } from 'src/epolicy/epolicy.loader';

@Resolver(() => Channel)
export class ChannelResolver {
  constructor(
    private readonly channelService: ChannelService,
    private readonly configMapService: ConfigmapService,
  ) {}

  @Query(() => Channel, { description: '通道详情' })
  async channel(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<Channel> {
    return this.channelService.getChannel(auth, name);
  }

  @Mutation(() => Channel, { description: '创建通道' })
  async channelCreate(
    @Auth() auth: JwtAuth,
    @Args('network') network: string,
    @Args('channel') channel: NewChannel,
  ): Promise<Channel> {
    return this.channelService.createChannel(auth, network, channel);
  }

  @Mutation(() => Channel, { description: '加入/去除Peer节点' })
  async channelUpdate(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('channel') channel: UpdateChannel,
  ): Promise<Channel> {
    return this.channelService.updateChannel(auth, name, channel);
  }

  @Mutation(() => Boolean, { description: '邀请组织' })
  async channelMemberUpdate(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('members', { type: () => [String] }) members: string[],
  ): Promise<boolean> {
    return this.channelService.updateMemberChannel(auth, name, members);
  }

  @ResolveField(() => Boolean, {
    description: '是否为我创建的',
  })
  async createdByMe(
    @Auth() auth: JwtAuth,
    @Parent() channel: Channel,
    @Loader(OrganizationLoader)
    orgLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<boolean> {
    const { preferred_username } = auth;
    const { members } = channel;
    if (!members) return;
    const orgs = await orgLoader.loadMany(members.map((m) => m.name));
    const orgMap = new Map(
      (orgs as Organization[]).map((org) => [org.name, org]),
    );
    let iCreated = false;
    members.forEach((m) => {
      if (orgMap.has(m.name)) {
        const v = orgMap.get(m.name);
        if (m.initiator && v.admin === preferred_username) {
          iCreated = true;
        }
      }
    });
    return iCreated;
  }

  @ResolveField(() => Boolean, {
    description: '是否为我参与的',
  })
  async iamInvolved(
    @Auth() auth: JwtAuth,
    @Parent() channel: Channel,
    @Loader(OrganizationLoader)
    orgLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<boolean> {
    const { preferred_username } = auth;
    const { members } = channel;
    if (!members) return;
    const orgs = await orgLoader.loadMany(members.map((m) => m.name));
    const orgMap = new Map(
      (orgs as Organization[]).map((org) => [org.name, org]),
    );
    let involved = false;
    members.forEach((m) => {
      if (orgMap.has(m.name)) {
        const v = orgMap.get(m.name);
        if (v.clients?.includes(preferred_username)) {
          involved = true;
        }
      }
    });
    return involved;
  }

  @ResolveField(() => [Epolicy], {
    nullable: true,
    description: '背书策略',
  })
  async epolicy(
    @Parent() channel: Channel,
    @Loader(EpolicyLoader) epolicyLoader: DataLoader<Epolicy['name'], Epolicy>,
  ): Promise<Epolicy[]> {
    const { name } = channel;
    const epolicies = await epolicyLoader.loadAll();
    return epolicies?.filter((epolicy) => epolicy.channel === name);
  }

  @ResolveField(() => String, {
    nullable: true,
    description: '通道连接文件',
  })
  async profileJson(
    @Auth() auth: JwtAuth,
    @Parent() channel: Channel,
    @Loader(OrganizationLoader)
    orgLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<string> {
    const { name, members } = channel;
    const { preferred_username } = auth;
    const orgs = await orgLoader.loadMany(members?.map((m) => m.name));
    const adminMembers = (orgs as Organization[])
      ?.filter((m) => m.admin === preferred_username)
      ?.map((m) => m.name);
    if (!adminMembers || adminMembers.length === 0) return;
    const { binaryData } = await this.configMapService.getConfigmap(
      auth,
      `chan-${name}-connection-profile`,
      adminMembers[0],
    );
    return decodeBase64(binaryData['profile.json']);
  }

  @ResolveField(() => [Chaincode], {
    nullable: true,
    description: '合约',
  })
  async chaincode(
    @Parent() channel: Channel,
    @Loader(ChaincodeLoader)
    chaincodeLoader: DataLoader<Chaincode['name'], Chaincode>,
  ): Promise<Chaincode[]> {
    const { name } = channel;
    const ccAll = await chaincodeLoader.loadAll();
    const ccs = ccAll?.filter((cc) => cc.channel === name);
    return ccs;
  }
}
