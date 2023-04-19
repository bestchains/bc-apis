import { Args, Query, Resolver } from '@nestjs/graphql';
import { ContractService } from './contract.service';
import { Contract } from './models/contract.model';
import { Lang } from './models/Lang.enum';

@Resolver()
export class ContractResolver {
  constructor(private readonly contractService: ContractService) {}

  @Query(() => [Contract], { nullable: true, description: '智能合约列表' })
  async contracts(
    @Args('lang', { type: () => Lang, nullable: true, description: '本地语言' })
    lang: Lang,
  ): Promise<Contract[]> {
    return this.contractService.getContracts(lang);
  }
}
