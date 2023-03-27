import { Injectable, Scope } from '@nestjs/common';
import { OrderedNestDataLoader } from 'src/common/dataloader';
import { JwtAuth } from 'src/types';
import { ChaincodeService } from './chaincode.service';
import { Chaincode } from './models/chaincode.model';

@Injectable({ scope: Scope.REQUEST })
export class ChaincodeLoader extends OrderedNestDataLoader<
  Chaincode['name'],
  Chaincode
> {
  constructor(private readonly chaincodeService: ChaincodeService) {
    super();
  }

  protected getOptions = (auth: JwtAuth) => ({
    propertyKey: 'name',
    query: () => this.chaincodeService.getChaincodes(auth),
  });
}
