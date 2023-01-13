import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'src/common/dataloader';
import { Auth } from 'src/common/decorators/auth.decorator';
import { JwtAuth } from 'src/types';
import { User } from 'src/users/models/user.model';
import { UsersLoader } from 'src/users/users.loader';
import { NewOrganizationInput } from './dto/new-organization.input';
import { UpdateOrganization } from './dto/update-organization.input';
import { Organization } from './models/organization.model';
import { OrganizationService } from './organization.service';

@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(private readonly orgService: OrganizationService) {}

  @Query(() => [Organization], { description: '组织列表' })
  async organizations(
    @Auth() auth: JwtAuth,
    @Args('admin', { nullable: true, description: '根据组织管理员搜索' })
    admin: string,
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

  @Mutation(() => Organization, { description: '修改组织' })
  async organizationUpdate(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('organization') organization: UpdateOrganization,
  ): Promise<Organization> {
    return this.orgService.updateOrganization(auth, name, organization);
  }

  @ResolveField(() => [User], { description: '组织内用户' })
  async users(
    @Parent() org: Organization,
    @Loader(UsersLoader) usersLoader: DataLoader<User['name'], User>,
  ): Promise<User[]> {
    const { clients, admin } = org;
    const names = [...new Set([...(clients || []), ...(admin ? [admin] : [])])];
    const users = await usersLoader.loadMany(names);
    return (users as User[]).map((u) => ({
      ...u,
      isOrganizationAdmin: admin === u.name,
    }));
  }
}
