import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { UpdateVote } from './dto/update-vote.input';
import { Vote } from './models/vote.model';

@Injectable()
export class VoteService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(vote: CRD.Vote): Vote {
    return {
      name: vote.metadata?.name,
      organizationName: vote.spec?.organizationName,
      proposalName: vote.spec?.proposalName,
      voteTime: vote.status?.voteTime,
      decision: vote.spec?.decision,
      description: vote.spec?.description,
      status: vote.status?.phase,
    };
  }

  async getVotes(auth: JwtAuth, namespace: string): Promise<Vote[]> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.vote.list(namespace);
    return body.items.map((item) => this.format(item));
  }

  async getVote(auth: JwtAuth, name: string, namespace: string): Promise<Vote> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.vote.read(name, namespace);
    return this.format(body);
  }

  async updateVote(
    auth: JwtAuth,
    name: string,
    namespace: string,
    vote: UpdateVote,
  ): Promise<Vote> {
    const { decision, description } = vote;
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.vote.patchMerge(name, namespace, {
      spec: {
        decision,
        description,
      },
    });
    return this.format(body);
  }
}
