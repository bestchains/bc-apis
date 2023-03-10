import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { Federation } from './models/federation.model';
import { JwtAuth } from 'src/types';
import { CRD } from 'src/kubernetes/lib';
import { NewFederationInput } from './dto/new-federation.input';
import { ProposalService } from 'src/proposal/proposal.service';
import { ProposalType } from 'src/proposal/models/proposal-type.enum';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { OrganizationService } from 'src/organization/organization.service';
import { uniq } from 'lodash';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';

@Injectable()
export class FederationService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly proposalService: ProposalService,
    private readonly organizationService: OrganizationService,
  ) {}

  private logger = new Logger('FederationService');

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
      const feds = o.federations || [];
      return p.concat(feds);
    }, []);
    const res = await Promise.allSettled(
      uniq(fedNames)?.map((fed) => this.federation(auth, fed)),
    );
    const feds = [];
    res?.forEach((r) => {
      if (r.status === 'fulfilled') {
        feds.push(r.value);
      } else {
        this.logger.error('Failure', r.reason?.body);
      }
    });
    return feds;
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
    const {
      name,
      policy,
      organizations = [],
      description,
      initiator,
    } = federation;
    const orgs = [...new Set([...organizations, initiator])];
    const k8s = await this.k8sService.getClient(auth);
    // 1. ????????????
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

    // 2. ????????????
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

  async confirmedInitiator(auth: JwtAuth, name: string): Promise<string> {
    // ?????????????????????????????????admin?????????????????????????????????????????????????????????????????????
    const { preferred_username } = auth;
    const orgs = await this.organizationService.getOrganizations(
      auth,
      preferred_username,
    );
    const orgNames = orgs.map((o) => o.name);
    const { members } = await this.federation(auth, name);
    const initiator =
      orgNames.find((o) => members?.some((m) => m.name === o)) || orgNames[0];
    return initiator;
  }

  async addOrganizationToFederation(
    auth: JwtAuth,
    name: string,
    organizations: string[],
  ) {
    // 0. ???????????????
    const initiator = await this.confirmedInitiator(auth, name);

    // 1. ????????????
    await this.proposalService.createProposal(
      auth,
      ProposalType.AddMemberProposal,
      {
        federation: name,
        initiator,
        organizations,
      },
    );

    // 2. ??????????????????
    // 3. ??????????????????????????????????????????????????????
    return true; // ????????????????????????????????????????????????????????????
  }

  async removeOrganizationFromFederation(
    auth: JwtAuth,
    name: string,
    organization: string,
  ) {
    // 0. ???????????????
    const initiator = await this.confirmedInitiator(auth, name);

    // 1. ????????????
    await this.proposalService.createProposal(
      auth,
      ProposalType.DeleteMemberProposal,
      {
        federation: name,
        initiator,
        organizations: [organization],
      },
    );

    // 2. ??????????????????
    // 3. ??????????????????????????????????????????????????????
    return true; // ????????????????????????????????????????????????????????????
  }

  async dissolveFederation(auth: JwtAuth, name: string) {
    // 0. ???????????????
    const initiator = await this.confirmedInitiator(auth, name);

    // 1. ????????????
    await this.proposalService.createProposal(
      auth,
      ProposalType.DissolveFederationProposal,
      {
        federation: name,
        initiator,
      },
    );

    // 2. ??????????????????
    // 3. ????????????????????????????????????????????????
    return true; // ????????????????????????????????????????????????????????????
  }

  async deleteFederation(auth: JwtAuth, name: string): Promise<K8sV1Status> {
    const detail = await this.federation(auth, name);
    if (detail?.status !== CrdStatusType.FederationDissolved) {
      throw new InternalServerErrorException(
        'Only dissolved federation can be deleted.',
      );
    }

    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.federation.delete(name);
    return body;
  }
}
