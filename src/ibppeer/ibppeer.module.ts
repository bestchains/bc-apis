import { Module } from '@nestjs/common';
import { IbppeerService } from './ibppeer.service';
import { IbppeerResolver } from './ibppeer.resolver';
import { ConfigmapModule } from 'src/configmap/configmap.module';
import { PodModule } from 'src/pod/pod.module';

@Module({
  providers: [IbppeerService, IbppeerResolver],
  exports: [IbppeerService],
  imports: [ConfigmapModule, PodModule],
})
export class IbppeerModule {}
