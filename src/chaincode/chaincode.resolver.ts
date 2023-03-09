import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { ChaincodeService } from './chaincode.service';
import { NewChaincode } from './dto/new-chaincode.input';

@Resolver()
export class ChaincodeResolver {
  constructor(private readonly ccService: ChaincodeService) {}

  @Mutation(() => Boolean, {
    description:
      '部署合约（返回true，只表示这个操作触发成功，而不是部署合约成功）',
  })
  async chaincodeDeploy(
    @Auth() auth: JwtAuth,
    @Args('chaincode') chaincode: NewChaincode,
  ): Promise<boolean> {
    return this.ccService.deployChaincode(auth, chaincode);
  }
}
