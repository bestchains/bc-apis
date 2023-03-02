import { ForbiddenException, Injectable } from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { Channel } from 'src/channel/models/channel.model';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { NetworkService } from 'src/network/network.service';
import { OrganizationService } from 'src/organization/organization.service';
import { JwtAuth } from 'src/types';
import { NewEpolicyInput } from './dto/new-epolicy.input';
import { Epolicy } from './models/epolicy.model';

@Injectable()
export class EpolicyService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly networkService: NetworkService,
    private readonly channelService: ChannelService,
    private readonly orgService: OrganizationService,
  ) {}

  format(epolicy: CRD.EndorsePolicy): Epolicy {
    const creationTimestamp = new Date(
      epolicy.metadata?.creationTimestamp,
    ).toISOString();
    const lastHeartbeatTime = epolicy.status?.lastHeartbeatTime
      ? new Date(epolicy.status?.lastHeartbeatTime).toISOString()
      : creationTimestamp;
    return {
      name: epolicy.metadata?.name,
      creationTimestamp,
      lastHeartbeatTime,
      channel: epolicy.spec?.channel,
      description: epolicy.spec?.description,
      value: epolicy.spec?.value,
    };
  }

  async getEpolicy(auth: JwtAuth, name: string): Promise<Epolicy> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.endorsePolicy.read(name);
    return this.format(body);
  }

  async getEpolicies(auth: JwtAuth, network?: string): Promise<Epolicy[]> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.endorsePolicy.list();
    const epolicies = body.items.map((item) => this.format(item));
    if (network) {
      const { channelNames } = await this.networkService.getNetwork(
        auth,
        network,
      );
      return epolicies.filter((p) => channelNames?.includes(p.channel));
    }
    return epolicies;
  }

  async createEpolicy(
    auth: JwtAuth,
    epolicy: NewEpolicyInput,
  ): Promise<Epolicy> {
    const { name, description, channel, value } = epolicy;
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.endorsePolicy.create({
      metadata: {
        name,
      },
      spec: {
        description,
        channel,
        value,
      },
    });
    return this.format(body);
  }

  async deleteEpolicy(auth: JwtAuth, name: string): Promise<K8sV1Status> {
    // 前置检查: 当前用户的组织同样在通道endorsePolicy.spec.channel中
    const { preferred_username } = auth;
    const { channel } = await this.getEpolicy(auth, name);
    const { members } = await this.channelService.getChannel(auth, channel);
    const orgs = await this.orgService.getOrganizations(auth);
    const myOrgs = orgs
      ?.filter(
        (org) =>
          org.admin === preferred_username ||
          org.clients?.includes(preferred_username),
      )
      ?.map((org) => org.name);
    if (!members.find((m) => myOrgs?.includes(m.name))) {
      throw new ForbiddenException(
        'your organization is not in the channel to which this policy belongs',
      );
    }
    // TODO: 前置检查：此策略未被任何合约 chaincode 使用

    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.endorsePolicy.delete(name);
    return body;
  }

  async getChannelsForCreateEpolicy(
    auth: JwtAuth,
    network: string,
  ): Promise<Channel[]> {
    const { preferred_username } = auth;
    const { channelNames } = await this.networkService.getNetwork(
      auth,
      network,
    );
    const channels = await this.channelService.getChannelsByNames(
      auth,
      channelNames,
    );
    const orgs = await this.orgService.getOrganizations(auth);
    const myOrgs = orgs
      ?.filter(
        (org) =>
          org.admin === preferred_username ||
          org.clients?.includes(preferred_username),
      )
      ?.map((org) => org.name);
    return channels?.filter((channel) =>
      channel.members?.find((m) => myOrgs?.includes(m.name)),
    );
  }
}
