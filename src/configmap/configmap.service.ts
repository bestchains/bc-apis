import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { JwtAuth, K8s } from 'src/types';
import { Configmap } from './models/configmap.model';

@Injectable()
export class ConfigmapService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(cm: K8s.V1ConfigMap): Configmap {
    return {
      name: cm.metadata.name,
      binaryData: cm.binaryData,
    };
  }

  async getConfigmap(
    auth: JwtAuth,
    name: string,
    namespace: string,
  ): Promise<Configmap> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.configMap.read(name, namespace);
    return this.format(body);
  }
}
