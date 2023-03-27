import { forwardRef, Module } from '@nestjs/common';
import { EpolicyService } from './epolicy.service';
import { EpolicyResolver } from './epolicy.resolver';
import { OrganizationModule } from 'src/organization/organization.module';
import { NetworkModule } from 'src/network/network.module';
import { ChannelModule } from 'src/channel/channel.module';
import { EpolicyLoader } from './epolicy.loader';

@Module({
  providers: [EpolicyService, EpolicyResolver, EpolicyLoader],
  imports: [OrganizationModule, NetworkModule, forwardRef(() => ChannelModule)],
  exports: [EpolicyLoader],
})
export class EpolicyModule {}
