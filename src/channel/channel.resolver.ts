import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { ChannelService } from './channel.service';
import { NewChannel } from './dto/new-channel.input';
import { UpdateChannel } from './dto/update-channel.input';
import { Channel } from './models/channel.model';

@Resolver()
export class ChannelResolver {
  constructor(private readonly channelService: ChannelService) {}

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
}
