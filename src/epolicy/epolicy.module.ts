import { forwardRef, Module } from '@nestjs/common';
import { EpolicyService } from './epolicy.service';
import { EpolicyResolver } from './epolicy.resolver';
import { OrganizationModule } from 'src/organization/organization.module';
import { NetworkModule } from 'src/network/network.module';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  providers: [EpolicyService, EpolicyResolver],
  imports: [
    OrganizationModule,
    forwardRef(() => NetworkModule),
    forwardRef(() => ChannelModule),
  ],
  exports: [EpolicyService],
})
export class EpolicyModule {}
