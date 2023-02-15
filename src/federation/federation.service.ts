import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { Federation } from './models/federation.model';
import { JwtAuth } from 'src/types';
import { CRD } from 'src/kubernetes/lib';
import { NewFederationInput } from './dto/new-federation.input';
import { ProposalService } from 'src/proposal/proposal.service';
import { ProposalType } from 'src/proposal/models/proposal-type.enum';
import { FederationStatus } from './models/federation-status.enum';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class FederationService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService,
  ) {}

  format(fed: CRD.Federation): Federation {
    return {
      name: fed.metadata.name,
      description: fed.spec?.description,
      initiatorName: fed.metadata?.labels?.['bestchains.federation.initiator'],
      members: fed.spec?.members,
      networkNames: fed.status?.networks,
      creationTimestamp: new Date(
        fed.metadata?.creationTimestamp,
      ).toISOString(),
      policy: fed.spec?.policy,
      status: fed.status?.type,
    };
  }

  async federations(auth: JwtAuth): Promise<Federation[]> {
    const { preferred_username } = auth;
    const adminOrgs = await this.organizationService.getOrganizations(
      auth,
      preferred_username,
    );
    const fedNames = adminOrgs?.reduce((p, o) => {
      const feds = o.federations
        ?.map((f) => f?.name)
        ?.filter((d: string) => !!d);
      return p.concat(feds);
    }, []);
    return Promise.all(fedNames.map((fn) => this.federation(auth, fn)));
  }

  async federation(auth: JwtAuth, name: string): Promise<Federation> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.federation.read(name);
    return this.format(body);
  }

  async createFederation(
    auth: JwtAuth,
    federation: NewFederationInput,
  ): Promise<Federation> {
    const { name, policy, organizations, description, initiator } = federation;
    const orgs = [...new Set([...organizations, initiator])];
    const k8s = await this.k8sService.getClient(auth);
    // 1. 创建联盟
    const { body } = await k8s.federation.create({
      metadata: {
        name,
        labels: {
          [`bestchains.federation.initiator`]: initiator,
        },
      },
      spec: {
        policy,
        description,
        license: {
          accept: true,
        },
        members: orgs.map((user) => ({
          name: user,
          initiator: user === initiator,
        })),
      },
    });

    // 2. 发起提案
    await this.proposalService.createProposal(
      auth,
      ProposalType.CreateFederationProposal,
      {
        federation: name,
        initiator,
      },
    );

    return this.format(body);
  }

  async addOrganizationToFederation(
    auth: JwtAuth,
    name: string,
    initiator: string,
    organizations: string[],
  ) {
    // 1. 发起提案
    await this.proposalService.createProposal(
      auth,
      ProposalType.AddMemberProposal,
      {
        federation: name,
        initiator,
        organizations,
      },
    );

    // 2. 等待组织投票
    // 3. 若投票成功，则此「联盟添加组织」成功
    return true; // 表示这个操作触发成功，而不是添加组织成功
  }

  async removeOrganizationFromFederation(
    auth: JwtAuth,
    name: string,
    initiator: string,
    organization: string,
  ) {
    // 1. 发起提案
    await this.proposalService.createProposal(
      auth,
      ProposalType.DeleteMemberProposal,
      {
        federation: name,
        initiator,
        organizations: [organization],
      },
    );

    // 2. 等待组织投票
    // 3. 若投票成功，则此「联盟驱逐组织」成功
    return true; // 表示这个操作触发成功，而不是驱逐组织成功
  }

  async dissolveFederation(auth: JwtAuth, name: string, initiator: string) {
    // 1. 发起提案
    await this.proposalService.createProposal(
      auth,
      ProposalType.DissolveFederationProposal,
      {
        federation: name,
        initiator,
      },
    );

    // 2. 等待组织投票
    // 3. 若投票成功，则此「解散联盟」成功
    return true; // 表示这个操作触发成功，而不是解散联盟成功
  }

  async deleteFederation(auth: JwtAuth, name: string): Promise<K8sV1Status> {
    const detail = await this.federation(auth, name);
    if (detail?.status !== FederationStatus.FederationDissolved) {
      throw new InternalServerErrorException(
        'Only dissolved federation can be deleted.',
      );
    }

    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.federation.delete(name);
    return body;
  }
}
