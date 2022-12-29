import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { NewOrganizationInput } from './dto/new-organization.input';
import { Organization } from './models/organization.model';
import { OrganizationService } from './organization.service';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly orgService: OrganizationService) {}

  @Query(() => [Organization], { description: '组织列表' })
  async organizations(
    @Auth() auth: JwtAuth,
    @Args('admin', { nullable: true }) admin: string,
  ): Promise<Organization[]> {
    return this.orgService.getOrganizations(auth, admin);
  }

  @Query(() => Organization, { description: '组织详情' })
  async organization(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<Organization> {
    return this.orgService.getOrganization(auth, name);
  }

  @Mutation(() => Organization, { description: '新增组织' })
  async organizationCreate(
    @Auth() auth: JwtAuth,
    @Args('organization') organization: NewOrganizationInput,
  ): Promise<Organization> {
    return this.orgService.createOrganization(auth, organization);
  }
}
