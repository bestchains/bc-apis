import { Module } from '@nestjs/common';
import { FederationService } from './federation.service';
import { FederationResolver } from './federation.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { FederationLoader } from './federation.loader';

@Module({
  providers: [FederationResolver, FederationService, FederationLoader],
  exports: [FederationService, FederationLoader],
  imports: [ProposalModule, OrganizationModule],
})
export class FederationModule {}
