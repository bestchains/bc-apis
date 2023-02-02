import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { camelCaseToKebabCase, genNanoid } from 'src/common/utils';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { NewProposal } from './dto/new-proposal.input';
import { ProposalPolicy } from './models/proposal-policy.enum';
import { ProposalType } from './models/proposal-type.enum';
import { Proposal } from './models/proposal.model';

@Injectable()
export class ProposalService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(pro: CRD.Proposal): Proposal {
    const type = pro.metadata?.labels?.['bestchains.proposal.type'];
    const infoKey = type
      ?.replace(/Proposal$/, '')
      ?.replace(/^([A-Z])/, (_: any, p1: string) => p1.toLocaleLowerCase());
    return {
      name: pro.metadata.name,
      creationTimestamp: new Date(
        pro.metadata?.creationTimestamp,
      ).toISOString(),
      type,
      policy: pro.spec?.policy,
      endAt: pro.spec?.endAt,
      statusPhase: pro.status?.phase,
      statusConfitionType: get(pro, 'status.conditions[0].type'),
      votes: pro.status?.votes?.map((v) => ({
        name: v.name,
        organizationName: v.organization.name,
        voteTime: v.voteTime,
        decision: v.decision,
        description: v.description,
        status: v.phase,
      })),
      initiatorName: pro.spec?.initiatorOrganization,
      federation: pro.spec?.federation,
      information: pro.spec?.[infoKey],
    };
  }

  async getProposals(auth: JwtAuth, type?: ProposalType): Promise<Proposal[]> {
    const labelSelector = [];
    if (type) {
      labelSelector.push(`bestchains.proposal.type=${type}`);
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body: pros } = await k8s.proposal.list({
      labelSelector: labelSelector.join(','),
    });
    return pros.items.map((pro) => this.format(pro));
  }

  async getProposal(auth: JwtAuth, name: string): Promise<Proposal> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.proposal.read(name);
    return this.format(body);
  }

  async createProposal(
    auth: JwtAuth,
    type: ProposalType,
    pro: NewProposal,
  ): Promise<Proposal> {
    const { federation, initiator, organizations, network } = pro;
    const k8s = await this.k8sService.getClient(auth);

    const spec: CRD.Proposal['spec'] = {
      policy: ProposalPolicy.All,
      federation,
      initiatorOrganization: initiator,
    };
    if (type === ProposalType.CreateFederationProposal) {
      spec.createFederation = {};
    }
    if (type === ProposalType.AddMemberProposal) {
      spec.addMember = {
        members: organizations,
      };
    }
    if (type === ProposalType.DeleteMemberProposal) {
      spec.deleteMember = {
        member: organizations[0],
      };
    }
    if (type === ProposalType.DissolveFederationProposal) {
      spec.dissolveFederation = {};
    }
    if (type === ProposalType.DissolveNetworkProposal) {
      spec.dissolveNetwork = {
        name: network,
      };
    }

    const { body } = await k8s.proposal.create({
      metadata: {
        name: genNanoid(camelCaseToKebabCase(type)),
      },
      spec,
    });
    return this.format(body);
  }
}
