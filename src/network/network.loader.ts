import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { Network } from './models/network.model';
import { NetworkService } from './network.service';

@Injectable({ scope: Scope.REQUEST })
export class NetworkLoader extends OrderedNestDataLoader<
  Network['name'],
  Network
> {
  constructor(private readonly networkService: NetworkService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    query: (keys: string[]) =>
      keys?.map((key) => this.networkService.getNetwork(auth, key)),
  });
}
