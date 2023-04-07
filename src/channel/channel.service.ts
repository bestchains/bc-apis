import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { filter, find, isEqual, uniq, uniqWith } from 'lodash';
import { SpecMember } from 'src/common/models/spec-member.model';
import { CustomException, flattenArr, genNanoid } from 'src/common/utils';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { NetworkService } from 'src/network/network.service';
import { OrganizationService } from 'src/organization/organization.service';
import { ProposalType } from 'src/proposal/models/proposal-type.enum';
import { ProposalService } from 'src/proposal/proposal.service';
import { JwtAuth } from 'src/types';
import { NewChannel } from './dto/new-channel.input';
import { Operate } from './dto/operate.enum';
import { UpdateChannel } from './dto/update-channel.input';
import { Channel } from './models/channel.model';

@Injectable()
export class ChannelService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly proposalService: ProposalService,
    @Inject(forwardRef(() => NetworkService))
    private readonly networkService: NetworkService,
    private readonly orgService: OrganizationService,
  ) {}

  private logger = new Logger('ChannelService');

  format(channel: CRD.Channel): Channel {
    return {
      name: channel.metadata.name,
      displayName: channel.spec?.id,
      creationTimestamp: new Date(
        channel.metadata?.creationTimestamp,
      ).toISOString(),
      members: channel.spec?.members,
      status: channel.status?.type,
      peers: channel.spec?.peers,
      network: channel.spec?.network,
      description: channel.spec?.description,
    };
  }

  async getChannel(auth: JwtAuth, name: string): Promise<Channel> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.read(name);
    return this.format(body);
  }

  async getMyChannels(auth: JwtAuth): Promise<Channel[]> {
    const networks = await this.networkService.getNetworks(auth);
    const chanNameses = networks?.map((n) => n.channelNames);
    return this.getChannelsByNames(auth, flattenArr(chanNameses));
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
    const { displayName, description, initiator, organizations, peers } =
      channel;
    const members = uniq((organizations || []).concat(initiator)).map((d) => ({
      name: d,
      initiator: d === initiator,
    }));
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.channel.create({
      metadata: {
        name: genNanoid('channel'),
      },
      spec: {
        id: displayName,
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

  async updateMemberChannel(
    auth: JwtAuth,
    name: string,
    members: string[],
  ): Promise<boolean> {
    // 1. 发起提案
    const [federation, initiator, oldMembers] =
      await this.getFedAndInitiatorForProposal(auth, name);
    const oldMemberMap = new Map((oldMembers || []).map((d) => [d.name, d]));
    const existMs = members.filter((m) => oldMemberMap.has(m));
    if (existMs && existMs.length > 0) {
      throw new CustomException(
        'FORBIDDEN_ORGANIZATION_EXIST',
        `Organizations ${existMs.join(',')} already exist`,
        HttpStatus.FORBIDDEN,
      );
    }
    await this.proposalService.createProposal(
      auth,
      ProposalType.UpdateChannelMemberProposal,
      {
        federation,
        initiator: initiator.name,
        channel: name,
        organizations: members,
      },
    );
    // 2. 等待组织投票
    // 3. 若投票成功，则此「通道添加组织」成功
    return true; // 表示这个操作触发成功，而不是通道添加组织成功
  }

  async getFedAndInitiatorForProposal(
    auth: JwtAuth,
    channel: string,
  ): Promise<[string, SpecMember, SpecMember[]]> {
    const { network, members } = await this.getChannel(auth, channel);
    const { federation } = await this.networkService.getNetwork(auth, network);
    const { preferred_username } = auth;
    const memberlist = await this.orgService.getOrganizations(auth);
    const adminMembers = memberlist
      .filter((m) => m.admin === preferred_username)
      .map((m) => m.name);
    const clientMembers = memberlist
      .filter((m) => m.clients?.includes(preferred_username))
      .map((m) => m.name);
    const initiator =
      members.find((m) => adminMembers.includes(m.name)) ||
      members.find((m) => clientMembers.includes(m.name));
    return [federation, initiator, members];
  }
}
