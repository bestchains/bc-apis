import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { ContractService } from './contract.service';
import { Contract } from './models/contract.model';
import { Lang } from './models/Lang.enum';

@Resolver()
export class ContractResolver {
  constructor(private readonly contractService: ContractService) {}

  @Query(() => [Contract], { nullable: true, description: '官方合约列表' })
  async contracts(
    @Args('lang', { type: () => Lang, nullable: true, description: '本地语言' })
    lang: Lang,
  ): Promise<Contract[]> {
    return this.contractService.getContracts(lang);
  }

  @Mutation(() => Boolean, {
    nullable: true,
    description: '导入官方合约到网络',
  })
  async contractImport(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('network') network: string,
  ): Promise<boolean> {
    return this.contractService.importContract(auth, name, network);
  }
}
