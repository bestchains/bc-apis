import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { IbppeerService } from './ibppeer.service';
import { Ibppeer } from './models/ibppeer.model';

@Resolver()
export class IbppeerResolver {
  constructor(private readonly ibppeerService: IbppeerService) {}

  @Mutation(() => Ibppeer, { description: '创建IBPPeer节点' })
  async ibppeerCreate(
    @Auth() auth: JwtAuth,
    @Args('organization', { description: '所在组织' }) org: string,
  ): Promise<Ibppeer> {
    return this.ibppeerService.createIbppeer(auth, org);
  }
}
