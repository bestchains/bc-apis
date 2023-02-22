import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { ChannelService } from './channel.service';
import { Channel } from './models/channel.model';

@Injectable({ scope: Scope.REQUEST })
export class ChannelLoader extends OrderedNestDataLoader<
  Channel['name'],
  Channel
> {
  constructor(private readonly channelService: ChannelService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    // TODO：list/channel 有权限问题，期望用read代替list，再次read的时候能缓存
    query: () => this.channelService.getChannels(auth),
  });
}
