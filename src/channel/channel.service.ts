import { Injectable } from '@nestjs/common';
import { filter, find, isEqual, uniqWith } from 'lodash';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { NewChannel } from './dto/new-channel.input';
import { Operate } from './dto/operate.enum';
import { UpdateChannel } from './dto/update-channel.input';
import { Channel } from './models/channel.model';

@Injectable()
export class ChannelService {
  constructor(private readonly k8sService: KubernetesService) {}

  format(channel: CRD.Channel): Channel {
    return {
      name: channel.metadata.name,
      creationTimestamp: new Date(
        channel.metadata?.creationTimestamp,
      ).toISOString(),
      members: channel.spec?.members,
      status: channel.status?.type,
      peers: channel.spec?.peers,
    };
  }

  // 权限问题，普通用户没有 list/channel
  async getChannels(auth: JwtAuth): Promise<Channel[]> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.list();
    return body.items.map((item) => this.format(item));
  }

  async getChannel(auth: JwtAuth, name: string): Promise<Channel> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.read(name);
    return this.format(body);
  }

  async createChannel(
    auth: JwtAuth,
    network: string,
    channel: NewChannel,
  ): Promise<Channel> {
    const {
      name,
      description,
      initiator,
      organizations,
      peers, // TODO：必须是用户管理的组织（在members中）下的节点（提供接口）
      policy,
    } = channel;
    const members = (organizations || [])
      .concat(initiator)
      .map((d) => ({ name: d }));
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.create({
      metadata: {
        name,
      },
      spec: {
        license: {
          accept: true,
        },
        network,
        description,
        members,
        peers,
      },
    });
    return this.format(body);
  }

  async updateChannel(
    auth: JwtAuth,
    name: string,
    channel: UpdateChannel,
  ): Promise<Channel> {
    const { peers, operate } = channel;
    const { peers: rawPeers } = await this.getChannel(auth, name);
    let cPeers = rawPeers || [];
    if (operate === Operate.add) {
      cPeers = cPeers.concat(peers);
    }
    if (operate === Operate.remove) {
      cPeers = filter(cPeers, (o) => !find(peers, o));
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.patchMerge(name, {
      spec: {
        peers: uniqWith(cPeers, isEqual),
      },
    });
    return this.format(body);
  }
}
