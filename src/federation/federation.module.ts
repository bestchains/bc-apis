import { Module } from '@nestjs/common';
import { FederationService } from './federation.service';
import { FederationResolver } from './federation.resolver';
import { ProposalModule } from 'src/proposal/proposal.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  providers: [FederationResolver, FederationService],
  exports: [FederationService],
  imports: [ProposalModule, OrganizationModule],
})
export class FederationModule {}
