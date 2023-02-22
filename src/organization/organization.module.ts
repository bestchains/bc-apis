import { Module } from '@nestjs/common';
import { IbppeerModule } from 'src/ibppeer/ibppeer.module';
import { OrganizationLoader } from './organization.loader';
import { OrganizationResolver } from './organization.resolver';
import { OrganizationService } from './organization.service';

@Module({
  providers: [OrganizationResolver, OrganizationService, OrganizationLoader],
  exports: [OrganizationLoader, OrganizationService],
  imports: [IbppeerModule],
})
export class OrganizationModule {}
