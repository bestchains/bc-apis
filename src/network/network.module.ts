import { forwardRef, Module } from '@nestjs/common';
import { NetworkService } from './network.service';
import { NetworkResolver } from './network.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { NetworkLoader } from './network.loader';
import { FederationModule } from 'src/federation/federation.module';
import { IbppeerModule } from 'src/ibppeer/ibppeer.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { ChaincodeModule } from 'src/chaincode/chaincode.module';
import { ChaincodebuildModule } from 'src/chaincodebuild/chaincodebuild.module';

@Module({
  providers: [NetworkService, NetworkResolver, NetworkLoader],
  exports: [NetworkLoader, NetworkService],
  imports: [
    ProposalModule,
    FederationModule,
    IbppeerModule,
    OrganizationModule,
    forwardRef(() => ChaincodeModule),
    forwardRef(() => ChaincodebuildModule),
  ],
})
export class NetworkModule {}
