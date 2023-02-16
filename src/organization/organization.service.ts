import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { DEFAULT_INGRESS_CLASS, DEFAULT_STORAGE_CLASS } from 'src/common/utils';
import imageConfig from 'src/config/image.config';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { NewOrganizationInput } from './dto/new-organization.input';
import { UpdateOrganization } from './dto/update-organization.input';
import { Organization } from './models/organization.model';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly k8sService: KubernetesService,
    @Inject(imageConfig.KEY)
    private imgConfig: ConfigType<typeof imageConfig>,
  ) {}

  logger = new Logger('OrganizationService');

  format(org: CRD.Organization): Organization {
    const creationTimestamp = new Date(
      org.metadata?.creationTimestamp,
    ).toISOString();
    const lastHeartbeatTime = org.status?.lastHeartbeatTime
      ? new Date(org.status?.lastHeartbeatTime).toISOString()
      : creationTimestamp;
    return {
      name: org.metadata.name,
      displayName: org.spec?.displayName,
      description: org.spec?.description,
      creationTimestamp,
      lastHeartbeatTime,
      admin: org.spec?.admin,
      status: org.status?.type,
      reason: org.status?.reason,
      clients: org.spec?.clients,
      federations: org.status?.federations
        ?.map((f) => f.name)
        ?.filter((d) => !!d),
    };
  }

  async getOrganizations(
    auth: JwtAuth,
    admin?: string,
  ): Promise<Organization[]> {
    const labelSelector = [];
    if (admin) {
      labelSelector.push(`bestchains.organization.admin=${admin}`);
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body: orgs } = await k8s.organization.list({
      labelSelector: labelSelector.join(','),
    });
    return orgs.items.map((org) => this.format(org));
  }

  async getOrganization(auth: JwtAuth, name: string): Promise<Organization> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.organization.read(name);
    return this.format(body);
  }

  async createOrganization(
    auth: JwtAuth,
    org: NewOrganizationInput,
  ): Promise<Organization> {
    const { name, displayName, description } = org;
    const { preferred_username, token } = auth;
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.organization.create({
      metadata: {
        name,
      },
      spec: {
        admin: preferred_username,
        displayName,
        description,
        admintoken: token,
        license: {
          accept: true,
        },
        caSpec: {
          version: '1.5.5',
          license: {
            accept: true,
          },
          ingress: {
            class: DEFAULT_INGRESS_CLASS,
          },
          images: {
            caImage: `${this.imgConfig.namespace}/fabric-ca`,
            caTag: this.imgConfig.repositories.fabricCA.tag,
            caInitImage: `${this.imgConfig.namespace}/ubi-minimal`,
            caInitTag: 'latest',
          },
          resources: {
            ca: {
              limits: {
                cpu: '100m',
                memory: '200M',
              },
              requests: {
                cpu: '10m',
                memory: '10M',
              },
            },
            init: {
              limits: {
                cpu: '100m',
                memory: '200M',
              },
              requests: {
                cpu: '10m',
                memory: '10M',
              },
            },
          },
          storage: {
            ca: {
              class: DEFAULT_STORAGE_CLASS,
              size: '100M',
            },
          },
        },
      },
    });
    return this.format(body);
  }

  // TODO: 增加权限校验（只有组织管理员才能patch/update）
  async updateOrganization(
    auth: JwtAuth,
    name: string,
    org: UpdateOrganization,
  ): Promise<Organization> {
    const { users, admin } = org;
    const { admin: orgAdmin } = await this.getOrganization(auth, name);
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.organization.patchMerge(name, {
      spec: {
        clients: users?.filter((u) => u !== orgAdmin),
        admin,
      },
    });
    return this.format(body);
  }

  async deleteOrganization(auth: JwtAuth, name: string): Promise<K8sV1Status> {
    const { federations } = await this.getOrganization(auth, name);
    if (federations && federations.length > 0) {
      throw new ForbiddenException(
        'the organization is initiator of one federation',
      );
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.organization.delete(name);
    return body;
  }
}
