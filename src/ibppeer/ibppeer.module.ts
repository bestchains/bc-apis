import { Module } from '@nestjs/common';
import { IbppeerService } from './ibppeer.service';
import { IbppeerResolver } from './ibppeer.resolver';
import { ConfigmapModule } from 'src/configmap/configmap.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  providers: [IbppeerService, IbppeerResolver],
  exports: [IbppeerService],
  imports: [ConfigmapModule, ChannelModule],
})
export class IbppeerModule {}
