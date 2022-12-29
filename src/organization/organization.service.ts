import { Injectable, Logger } from '@nestjs/common';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { NewOrganizationInput } from './dto/new-organization.input';
import { Organization } from './models/organization.model';

@Injectable()
export class OrganizationService {
  constructor(private readonly k8sService: KubernetesService) {}

  logger = new Logger('OrganizationService');

  format(org: CRD.Organization): Organization {
    return {
      name: org.metadata.name,
      displayName: org.metadata?.annotations?.displayName,
      creationTimestamp: new Date(
        org.metadata?.creationTimestamp,
      ).toISOString(),
      admin: org.spec?.admin,
      status: org.status?.type,
    };
  }

  async getOrganizations(
    auth: JwtAuth,
    admin?: string,
  ): Promise<Organization[]> {
    const labelSelector = [];
    if (admin) {
      labelSelector.push(`organization.admin=${admin}`);
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
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.organization.create({
      metadata: {
        name: org.name,
        annotations: {
          displayName: org.displayName,
          description: org.description,
        },
      },
    });
    return this.format(body);
  }
}
