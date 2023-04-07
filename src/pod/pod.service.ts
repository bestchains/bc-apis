import { Injectable } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { AnyObj, JwtAuth, K8s } from 'src/types';
import { Pod } from './models/pod.model';

@Injectable()
export class PodService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(pod: K8s.V1Pod): Pod {
    return {
      name: pod.metadata?.name,
      namespace: pod.metadata?.namespace,
      containers: pod.spec?.containers?.map((c) => c?.name),
    };
  }

  async getPod(auth: JwtAuth, name: string, namespace: string): Promise<Pod> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.pod.read(name, namespace);
    return this.format(body);
  }

  async getPods(
    auth: JwtAuth,
    namespace: string,
    matchLabels?: AnyObj,
  ): Promise<Pod[]> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.pod.list(namespace, {
      labelSelector: Object.entries(matchLabels || {})
        ?.map((d) => `${d[0]}=${d[1]}`)
        ?.join(','),
    });
    return body.items.map((d) => this.format(d));
  }
}
