import { Module } from '@nestjs/common';
import { EpolicyService } from './epolicy.service';
import { EpolicyResolver } from './epolicy.resolver';
import { OrganizationModule } from 'src/organization/organization.module';
import { NetworkModule } from 'src/network/network.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  providers: [EpolicyService, EpolicyResolver],
  imports: [OrganizationModule, NetworkModule, ChannelModule],
})
export class EpolicyModule {}
