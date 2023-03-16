import { forwardRef, Module } from '@nestjs/common';
import { ChaincodeService } from './chaincode.service';
import { ChaincodeResolver } from './chaincode.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { ChannelModule } from 'src/channel/channel.module';
import { NetworkModule } from 'src/network/network.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  providers: [ChaincodeService, ChaincodeResolver],
  imports: [
    ProposalModule,
    forwardRef(() => ChannelModule),
    NetworkModule,
    OrganizationModule,
  ],
  exports: [ChaincodeService],
})
export class ChaincodeModule {}
