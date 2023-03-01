import { Injectable, Logger } from '@nestjs/common';
import { filter, find, isEqual, uniq, uniqWith } from 'lodash';
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

  private logger = new Logger('ChannelService');

  format(channel: CRD.Channel): Channel {
    return {
      name: channel.metadata.name,
      creationTimestamp: new Date(
        channel.metadata?.creationTimestamp,
      ).toISOString(),
      members: channel.spec?.members,
      status: channel.status?.type,
      peers: channel.spec?.peers,
      description: channel.spec?.description,
    };
  }

  async getChannel(auth: JwtAuth, name: string): Promise<Channel> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.read(name);
    return this.format(body);
  }

  async getChannelsByNames(auth: JwtAuth, names: string[]): Promise<Channel[]> {
    const res = await Promise.allSettled(
      uniq(names).map((n) => n && this.getChannel(auth, n)),
    );
    const chans = [];
    res?.forEach((r) => {
      if (r.status === 'fulfilled') {
        chans.push(r.value);
      } else {
        this.logger.error('Failure', r.reason?.body);
      }
    });
    return chans;
  }

  async createChannel(
    auth: JwtAuth,
    network: string,
    channel: NewChannel,
  ): Promise<Channel> {
    const { name, description, initiator, organizations, peers, policy } =
      channel;
    const members = (organizations || [])
      .concat(initiator)
      .map((d) => ({ name: d, initiator: d === initiator }));
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
