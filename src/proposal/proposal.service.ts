import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { Proposal } from './models/proposal.model';

@Injectable()
export class ProposalService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(pro: CRD.Proposal): Proposal {
    return {
      name: pro.metadata.name,
      creationTimestamp: new Date(
        pro.metadata?.creationTimestamp,
      ).toISOString(),
      type: pro.metadata?.labels?.['proposal.type'],
      policy: pro.spec?.policy,
      endAt: pro.spec?.endAt,
      status: pro.status?.phase,
    };
  }

  async getProposals(auth: JwtAuth, type?: string): Promise<Proposal[]> {
    const labelSelector = [];
    if (type) {
      labelSelector.push(`proposal.type=${type}`);
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
}
