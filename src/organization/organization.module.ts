import { Module } from '@nestjs/common';
import { OrganizationLoader } from './organization.loader';
import { OrganizationResolver } from './organization.resolver';
import { OrganizationService } from './organization.service';

@Module({
  providers: [OrganizationResolver, OrganizationService, OrganizationLoader],
  exports: [OrganizationLoader, OrganizationService],
})
export class OrganizationModule {}
