import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { SpecMember } from 'src/common/models/spec-member.model';
import { genNanoid } from 'src/common/utils';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { NetworkService } from 'src/network/network.service';
import { OrganizationService } from 'src/organization/organization.service';
import { ProposalType } from 'src/proposal/models/proposal-type.enum';
import { ProposalService } from 'src/proposal/proposal.service';
import { JwtAuth } from 'src/types';
import { NewChaincode } from './dto/new-chaincode.input';
import { ChaincodePhase } from './models/chaincode-phase.enum';
import { Chaincode } from './models/chaincode.model';

@Injectable()
export class ChaincodeService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly proposalService: ProposalService,
    @Inject(forwardRef(() => ChannelService))
    private readonly channelService: ChannelService,
    @Inject(forwardRef(() => NetworkService))
    private readonly networkService: NetworkService,
    private readonly orgService: OrganizationService,
  ) {}

  format(chaincode: CRD.Chaincode): Chaincode {
    return {
      name: chaincode.metadata?.name,
      phase: chaincode.status?.phase,
      channel: chaincode.spec?.channel,
      epolicy: chaincode.spec?.endorsePolicyRef?.name,
      displayName: chaincode.spec?.id,
      version: chaincode.spec?.version,
    };
  }

  async getChaincode(auth: JwtAuth, name: string): Promise<Chaincode> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.chaincode.read(name);
    return this.format(body);
  }

  async getChaincodes(
    auth: JwtAuth,
    labels?: { id?: string; channel?: string; version?: string },
  ): Promise<Chaincode[]> {
    const labelSelector = [];
    if (labels?.id) {
      labelSelector.push(`bestchains.chaincode.id=${labels.id}`);
    }
    if (labels?.channel) {
      labelSelector.push(`bestchains.chaincode.channel=${labels.channel}`);
    }
    if (labels?.version) {
      labelSelector.push(`bestchains.chaincode.version=${labels.version}`);
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.chaincode.list({
      labelSelector: labelSelector.join(','),
    });
    return body.items.map((item) => this.format(item));
  }

  async deployChaincode(
    auth: JwtAuth,
    chaincode: NewChaincode,
  ): Promise<boolean> {
    const { channel, name: chaincodebuildName, version } = chaincode;

    // 1. 判断chaincode是否已存在
    const ccs = await this.getChaincodes(auth, {
      id: chaincodebuildName,
      channel,
      version,
    });
    if (ccs && ccs.length > 0) {
      // 部署的合约版本的升级
      const ccName = ccs[0]?.name;
      return this.upgradeChaincode(auth, ccName, chaincodebuildName, channel);
    } else {
      // 部署此版本合约
      return this.createChaincode(auth, chaincode);
    }
  }

  async createChaincode(
    auth: JwtAuth,
    chaincode: NewChaincode,
  ): Promise<boolean> {
    const { channel, epolicy, name: chaincodebuildName } = chaincode;
    // 1. 创建 chaincode
    const k8s = await this.k8sService.getClient(auth);
    const metadataName = genNanoid('chaincode');
    await k8s.chaincode.create({
      metadata: {
        name: metadataName,
      },
      spec: {
        license: {
          accept: true,
        },
        channel,
        initRequired: false,
        endorsePolicyRef: {
          name: epolicy,
        },
        externalBuilder: chaincodebuildName,
      },
    });

    // 2. 发起提案
    const [federation, initiator] = await this.getFedAndInitiatorForProposal(
      auth,
      channel,
    );
    await this.proposalService.createProposal(
      auth,
      ProposalType.DeployChaincodeProposal,
      {
        federation,
        initiator: initiator?.name,
        chaincode: metadataName,
        chaincodebuild: chaincodebuildName,
      },
    );

    // 3. 等待组织投票
    // 4. 若投票成功，则此「合约部署」成功
    return true; // 表示这个操作触发成功，而不是部署成功
  }

  async upgradeChaincode(
    auth: JwtAuth,
    chaincode: string,
    chaincodebuild: string,
    channel: string,
  ): Promise<boolean> {
    const [federation, initiator] = await this.getFedAndInitiatorForProposal(
      auth,
      channel,
    );
    await this.proposalService.createProposal(
      auth,
      ProposalType.UpgradeChaincodeProposal,
      {
        federation,
        initiator: initiator?.name,
        chaincode,
        chaincodebuild,
      },
    );
    // 2. 等待组织投票
    // 3. 若投票成功，则此「合约升级」成功
    return true; // 表示这个操作触发成功，而不是升级合约成功
  }

  async deleteChaincode(auth: JwtAuth, name: string): Promise<K8sV1Status> {
    // 1. 只允许删除 chaincode.status.phase=ChaincodeUnapproved
    const chaincode = await this.getChaincode(auth, name);
    if (chaincode.phase !== ChaincodePhase.ChaincodeUnapproved) {
      throw new ForbiddenException(
        'Reject deletion when the status is ChaincodeUnapproved',
      );
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.chaincode.delete(name);
    return body;
  }

  async getFedAndInitiatorForProposal(
    auth: JwtAuth,
    channel: string,
  ): Promise<[string, SpecMember]> {
    const { network, members } = await this.channelService.getChannel(
      auth,
      channel,
    );
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
    return [federation, initiator];
  }
}
