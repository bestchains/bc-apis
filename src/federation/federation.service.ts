import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { Federation } from './models/federation.model';
import { JwtAuth } from 'src/types';
import { CRD } from 'src/kubernetes/lib';

@Injectable()
export class FederationService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(ns: CRD.Federation): Federation {
    return {
      name: ns.metadata.name,
    };
  }

  async federations(auth: JwtAuth): Promise<Federation[]> {
    const k8s = await this.k8sService.getClient(auth);
    const { body: fedList } = await k8s.federation.list();
    return fedList.items.map((fed) => this.format(fed));
  }
}
