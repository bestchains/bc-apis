import { Injectable } from '@nestjs/common';
import { get } from 'lodash';
import { camelCaseToKebabCase, genNanoid } from 'src/common/utils';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { OrganizationService } from 'src/organization/organization.service';
import { JwtAuth } from 'src/types';
import { VotePhase } from 'src/vote/models/vote-phase.enum';
import { VoteService } from 'src/vote/vote.service';
import { NewProposal } from './dto/new-proposal.input';
import { ProposalPolicy } from './models/proposal-policy.enum';
import { ProposalType } from './models/proposal-type.enum';
import { Proposal } from './models/proposal.model';

@Injectable()
export class ProposalService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly organizationService: OrganizationService,
    private readonly voteService: VoteService,
  ) {}

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
        status: v.phase || VotePhase.NotVoted,
      })),
      initiatorName: pro.spec?.initiatorOrganization,
      federation: pro.spec?.federation,
      information: pro.spec?.[infoKey],
    };
  }

  async getProposals(auth: JwtAuth): Promise<Proposal[]> {
    const { preferred_username } = auth;
    const adminOrgs = await this.organizationService.getOrganizations(
      auth,
      preferred_username,
    );
    const nss = adminOrgs?.map((org) => org.name);
    const votess = await Promise.all(
      nss?.map((ns) => this.voteService.getVotes(auth, ns)),
    );
    const proposalNames = votess?.reduce((p, v) => {
      const ps = v.map((d) => d?.proposalName).filter((d) => !!d);
      return [...p, ...ps];
    }, []);
    return Promise.all(
      (proposalNames as string[])?.map((p) => this.getProposal(auth, p)),
    );
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
    const {
      federation,
      initiator,
      organizations,
      network,
      chaincode,
      chaincodebuild,
      channel,
    } = pro;
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
    if (type === ProposalType.DeployChaincodeProposal) {
      spec.deployChaincode = {
        chaincode,
        externalBuilder: chaincodebuild,
        members: [{ name: initiator, initiator: true }],
      };
    }
    if (type === ProposalType.UpgradeChaincodeProposal) {
      spec.upgradeChaincode = {
        chaincode,
        externalBuilder: chaincodebuild,
        members: [{ name: initiator, initiator: true }],
      };
    }
    if (type === ProposalType.UpdateChannelMemberProposal) {
      spec.updateChannelMember = {
        channel,
        members: organizations,
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
