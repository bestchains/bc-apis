import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { FederationService } from './federation.service';
import { Federation } from './models/federation.model';

@Injectable({ scope: Scope.REQUEST })
export class FederationLoader extends OrderedNestDataLoader<
  Federation['name'],
  Federation
> {
  constructor(private readonly federationService: FederationService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    query: (keys: string[]) =>
      keys?.map((key) => this.federationService.federation(auth, key)),
  });
}
