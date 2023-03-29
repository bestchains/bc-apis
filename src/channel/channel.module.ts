import { forwardRef, Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelResolver } from './channel.resolver';
import { ChannelLoader } from './channel.loader';
import { EpolicyModule } from 'src/epolicy/epolicy.module';
import { ConfigmapModule } from 'src/configmap/configmap.module';
import { ChaincodeModule } from 'src/chaincode/chaincode.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { NetworkModule } from 'src/network/network.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  providers: [ChannelService, ChannelResolver, ChannelLoader],
  exports: [ChannelLoader, ChannelService],
  imports: [
    forwardRef(() => EpolicyModule),
    forwardRef(() => ChaincodeModule),
    ConfigmapModule,
    ProposalModule,
    forwardRef(() => NetworkModule),
    OrganizationModule,
  ],
})
export class ChannelModule {}
