import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { Organization } from './models/organization.model';
import { OrganizationService } from './organization.service';

@Injectable({ scope: Scope.REQUEST })
export class OrganizationLoader extends OrderedNestDataLoader<
  Organization['name'],
  Organization
> {
  constructor(private readonly orgService: OrganizationService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    query: () => this.orgService.getOrganizations(auth),
  });
}
