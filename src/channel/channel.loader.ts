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
    query: (keys: string[]) =>
      keys?.map((key) => this.channelService.getChannel(auth, key)),
  });
}
