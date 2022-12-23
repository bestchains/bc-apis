import { Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { FederationService } from './federation.service';
import { Federation } from './models/federation.model';

@Resolver()
export class FederationResolver {
  constructor(private readonly federationService: FederationService) {}

  @Query(() => [Federation], { description: '项目列表' })
  async federations(@Auth() auth: JwtAuth): Promise<Federation[]> {
    return this.federationService.federations(auth);
  }
}
