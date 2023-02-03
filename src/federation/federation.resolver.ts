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
import { Network } from 'src/network/models/network.model';
import { NetworkLoader } from 'src/network/network.loader';
import { Organization } from 'src/organization/models/organization.model';
import { OrganizationLoader } from 'src/organization/organization.loader';
import { JwtAuth } from 'src/types';
import { NewFederationInput } from './dto/new-federation.input';
import { FederationService } from './federation.service';
import { Federation } from './models/federation.model';

@Resolver(() => Federation)
export class FederationResolver {
  constructor(private readonly federationService: FederationService) {}

  @Query(() => [Federation], { description: '联盟列表' })
  async federations(@Auth() auth: JwtAuth): Promise<Federation[]> {
    return this.federationService.federations(auth);
  }

  @Query(() => Federation, { description: '联盟详情' })
  async federation(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<Federation> {
    return this.federationService.federation(auth, name);
  }

  @Mutation(() => Federation, { description: '创建联盟' })
  async federationCreate(
    @Auth() auth: JwtAuth,
    @Args('federation') federation: NewFederationInput,
  ): Promise<Federation> {
    return this.federationService.createFederation(auth, federation);
  }

  @Mutation(() => Boolean, {
    description:
      '向联盟中添加组织（返回true：只表示这个操作触发成功，而不是添加组织成功）',
  })
  async federationAddOrganization(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('initiator', { description: '发起者（当前用户所在的组织）' })
    initiator: string,
    @Args('organizations', {
      type: () => [String],
      description: '要添加的组织',
    })
    organizations: string[],
  ): Promise<boolean> {
    return this.federationService.addOrganizationToFederation(
      auth,
      name,
      initiator,
      organizations,
    );
  }

  @Mutation(() => Boolean, {
    description:
      '从联盟中驱逐一个组织（返回true：只表示这个操作触发成功，而不是驱逐组织成功）',
  })
  async federationRemoveOrganization(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('initiator', { description: '发起者（当前用户所在的组织）' })
    initiator: string,
    @Args('organization', { description: '要驱逐的组织' }) organization: string,
  ): Promise<boolean> {
    return this.federationService.removeOrganizationFromFederation(
      auth,
      name,
      initiator,
      organization,
    );
  }

  @Mutation(() => Boolean, {
    description:
      '解散联盟（返回true：只表示这个操作触发成功，而不是解散联盟成功)',
  })
  async federationDissolve(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
    @Args('initiator', { description: '发起者（当前用户所在的组织）' })
    initiator: string,
  ): Promise<boolean> {
    return this.federationService.dissolveFederation(auth, name, initiator);
  }

  @Mutation(() => K8sV1Status, {
    description: '删除联盟（FederationDissolved）',
  })
  async federationDelete(
    @Auth() auth: JwtAuth,
    @Args('name') name: string,
  ): Promise<K8sV1Status> {
    return this.federationService.deleteFederation(auth, name);
  }

  @ResolveField(() => String, {
    nullable: true,
    description: '当前用户所属组织加入此联盟的时间',
  })
  async joinedAt(
    @Auth() auth: JwtAuth,
    @Parent() fed: Federation,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<string> {
    const { members } = fed;
    const { preferred_username } = auth;
    if (!members) return;
    const orgs = await organizationLoader.loadMany(
      members.map((member) => member.name),
    );
    const memberMap = new Map(members.map((m) => [m.name, m.joinedAt]));
    const org = (orgs as Organization[]).find(
      (org) => org.admin === preferred_username,
    );
    return memberMap.get(org?.name);
  }

  @ResolveField(() => [Organization], { description: '联盟内组织' })
  async organizations(
    @Parent() fed: Federation,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<Organization[]> {
    const { members } = fed;
    if (!members) return [];
    const orgs = await organizationLoader.loadMany(
      members.map((member) => member.name),
    );
    const memberMap = new Map(members.map((m) => [m.name, m.joinedAt]));
    return (orgs as Organization[]).map((org) => ({
      ...org,
      joinedAt: memberMap.get(org.name),
    }));
  }

  @ResolveField(() => Organization, {
    nullable: true,
    description: '发起者（组织）',
  })
  async initiator(
    @Parent() fed: Federation,
    @Loader(OrganizationLoader)
    organizationLoader: DataLoader<Organization['name'], Organization>,
  ): Promise<Organization> {
    const { initiatorName } = fed;
    if (!initiatorName) return;
    const org = await organizationLoader.load(initiatorName);
    return org;
  }

  @ResolveField(() => [Network], {
    nullable: true,
    description: '联盟内网络',
  })
  async networks(
    @Parent() fed: Federation,
    @Loader(NetworkLoader) networkLoader: DataLoader<Network['name'], Network>,
  ): Promise<Network[]> {
    const { networkNames } = fed;
    if (!networkNames) return;
    const nets = await networkLoader.loadMany(networkNames);
    return nets;
  }
}
