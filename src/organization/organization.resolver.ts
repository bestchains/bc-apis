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
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { FederationLoader } from 'src/federation/federation.loader';
import { Federation } from 'src/federation/models/federation.model';
import { Network } from 'src/network/models/network.model';
import { NetworkLoader } from 'src/network/network.loader';
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

  @Mutation(() => K8sV1Status, { description: '删除组织' })
  async organizationDelete(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<K8sV1Status> {
    return this.orgService.deleteOrganization(auth, name);
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

  @ResolveField(() => [Network], {
    nullable: true,
    description: '组织所在的网络',
  })
  async networks(
    @Auth() auth: JwtAuth,
    @Parent() org: Organization,
    @Loader(FederationLoader)
    fedLoader: DataLoader<Federation['name'], Federation>,
    @Loader(NetworkLoader) networkLoader: DataLoader<Network['name'], Network>,
  ): Promise<Network[]> {
    const { preferred_username } = auth;
    const { federations, admin, name } = org;
    // TODO: 当前用户不在此组织中，没有get/federation get/network权限
    if (admin !== preferred_username) return;
    if (!federations) return;
    const feds = await fedLoader.loadMany(federations);
    const netNames = (feds as Federation[])
      ?.map((f) => f?.networkNames)
      ?.filter((d) => !!d);
    if (!netNames || netNames.length === 0) return;
    const nets = await networkLoader.loadMany([...new Set(netNames.flat())]);
    return (nets as Network[])?.filter((net) => {
      const members = net?.members?.map((m) => m.name);
      return members?.includes(name);
    });
  }
}
