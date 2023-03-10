import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { uniq } from 'lodash';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import {
  DEFAULT_INGRESS_CLASS,
  DEFAULT_STORAGE_CLASS,
  NETWORK_VERSION_RESOURCES,
} from 'src/common/utils';
import imageConfig from 'src/config/image.config';
import { FederationService } from 'src/federation/federation.service';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { ProposalType } from 'src/proposal/models/proposal-type.enum';
import { ProposalService } from 'src/proposal/proposal.service';
import { JwtAuth } from 'src/types';
import { NewNetworkInput } from './dto/new-network.input';
import { OrderVersion } from './dto/order-version.enum';
import { Network } from './models/network.model';

@Injectable()
export class NetworkService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly proposalService: ProposalService,
    private readonly fedService: FederationService,
    @Inject(imageConfig.KEY)
    private imgConfig: ConfigType<typeof imageConfig>,
  ) {}

  private logger = new Logger('NetworkService');

  format(network: CRD.Network): Network {
    const creationTimestamp = new Date(
      network.metadata?.creationTimestamp,
    ).toISOString();
    const lastHeartbeatTime = network.status?.lastHeartbeatTime
      ? new Date(network.status?.lastHeartbeatTime).toISOString()
      : creationTimestamp;
    return {
      name: network.metadata.name,
      creationTimestamp,
      lastHeartbeatTime,
      federation: network.spec?.federation,
      members: network.spec?.members,
      initiatorName: network.spec?.members?.find((m) => m.initiator)?.name,
      clusterSize: network.spec?.orderSpec?.clusterSize,
      status: network.status?.type,
      ordererType: network.spec?.orderSpec?.ordererType,
      channelNames: network.status?.channels,
      description: network.spec?.description,
      limits: network.spec?.orderSpec?.resources?.init?.limits,
      storage: network.spec?.orderSpec?.storage?.orderer?.size,
    };
  }

  async getNetwork(auth: JwtAuth, name: string): Promise<Network> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.network.read(name);
    return this.format(body);
  }

  async getNetworks(auth: JwtAuth): Promise<Network[]> {
    const feds = await this.fedService.federations(auth);
    let netNames = [];
    feds?.forEach((fed) => {
      if (fed.networkNames) {
        netNames = netNames.concat(fed.networkNames);
      }
    });
    const res = await Promise.allSettled(
      uniq(netNames)?.map(
        (netName) => netName && this.getNetwork(auth, netName),
      ),
    );
    const nets = [];
    res?.forEach((r) => {
      if (r.status === 'fulfilled') {
        nets.push(r.value);
      } else {
        this.logger.error('Failure', r.reason?.body);
      }
    });
    return nets;
  }

  async createNetwork(
    auth: JwtAuth,
    network: NewNetworkInput,
  ): Promise<Network> {
    const { token } = auth;
    const {
      federation,
      initiator,
      clusterSize,
      ordererType,
      version,
      name,
      description,
    } = network;
    const resource = NETWORK_VERSION_RESOURCES[OrderVersion[version]];
    const resources = {
      limits: {
        cpu: resource[0],
        memory: resource[1],
      },
      requests: {
        cpu: resource[2],
        memory: resource[3],
      },
    };
    const size = resource[4];

    const { members } = await this.fedService.federation(auth, federation);
    const organizations = members?.map((m) => m.name);

    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.network.create({
      metadata: {
        name,
      },
      spec: {
        initialToken: token,
        license: {
          accept: true,
        },
        federation,
        description,
        members: [...new Set([...organizations, initiator])].map((org) => ({
          name: org,
          initiator: org === initiator,
        })),
        orderSpec: {
          license: {
            accept: true,
          },
          clusterSize,
          ordererType,
          ingress: {
            class: DEFAULT_INGRESS_CLASS,
          },
          resources: {
            init: resources,
            orderer: resources,
          },
          storage: {
            orderer: {
              class: DEFAULT_STORAGE_CLASS,
              size,
            },
          },
          images: {
            ordererInitImage: `${this.imgConfig.namespace}/ubi-minimal`,
            ordererInitTag: 'latest',
            grpcwebImage: `${this.imgConfig.namespace}/grpc-web`,
            grpcwebTag: 'latest',
            ordererImage: `${this.imgConfig.namespace}/fabric-orderer`,
            ordererTag: this.imgConfig.repositories.fabricOrderer.tag,
          },
        },
      },
    });
    return this.format(body);
  }

  async dissolveNetwork(
    auth: JwtAuth,
    name: string,
    federation: string,
    initiator: string,
  ): Promise<boolean> {
    // 0. ??????????????????????????????
    const { channelNames } = await this.getNetwork(auth, name);
    if (channelNames && channelNames.length > 0) {
      throw new ForbiddenException('channel also exist in the network');
    }
    // 1. ????????????
    await this.proposalService.createProposal(
      auth,
      ProposalType.DissolveNetworkProposal,
      {
        federation,
        initiator,
        network: name,
      },
    );

    // 2. ??????????????????
    // 3. ????????????????????????????????????????????????
    return true; // ????????????????????????????????????????????????????????????
  }

  async deleteNetwork(auth: JwtAuth, name: string): Promise<K8sV1Status> {
    // 0. ??????????????????????????????
    const { channelNames } = await this.getNetwork(auth, name);
    if (channelNames && channelNames.length > 0) {
      throw new ForbiddenException('channel also exist in the network');
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.network.delete(name);
    return body;
  }
}
