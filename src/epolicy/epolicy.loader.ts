import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { EpolicyService } from './epolicy.service';
import { Epolicy } from './models/epolicy.model';

@Injectable({ scope: Scope.REQUEST })
export class EpolicyLoader extends OrderedNestDataLoader<
  Epolicy['name'],
  Epolicy
> {
  constructor(private readonly epolicyService: EpolicyService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    query: () => this.epolicyService.getEpolicies(auth),
  });
}
