import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ChaincodeService } from 'src/chaincode/chaincode.service';
import { K8sV1Status } from 'src/common/models/k8s-v1-status.model';
import { SpecMember } from 'src/common/models/spec-member.model';
import { genNanoid, MINIO_BUCKET_NAME } from 'src/common/utils';
import imageConfig from 'src/config/image.config';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { MinioService } from 'src/minio/minio.service';
import { NetworkService } from 'src/network/network.service';
import { OrganizationService } from 'src/organization/organization.service';
import { JwtAuth } from 'src/types';
import { NewChaincodebuild } from './dto/new-chaincodebuild.input';
import { UpgradeChaincodebuild } from './dto/upgrade-chaincodebuild.input';
import { Chaincodebuild } from './models/chaincodebuild.model';

@Injectable()
export class ChaincodebuildService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly minioService: MinioService,
    private readonly networkService: NetworkService,
    private readonly orgService: OrganizationService,
    private readonly chaincodeService: ChaincodeService,
    @Inject(imageConfig.KEY)
    private imgConfig: ConfigType<typeof imageConfig>,
  ) {}

  logger = new Logger('ChaincodebuildService');

  format(ccb: CRD.ChaincodeBuild): Chaincodebuild {
    return {
      name: ccb.metadata?.name,
      displayName: ccb.spec?.id,
      status: ccb.status?.type,
      creationTimestamp: new Date(
        ccb.metadata?.creationTimestamp,
      ).toISOString(),
      version: ccb.spec?.version,
      network: ccb.spec?.network,
      initiator: ccb.spec?.initiator,
    };
  }

  async getChaincodebuild(
    auth: JwtAuth,
    name: string,
  ): Promise<Chaincodebuild> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.chaincodeBuild.read(name);
    return this.format(body);
  }

  async getChaincodebuilds(
    auth: JwtAuth,
    labels?: {
      id?: string;
      network?: string;
      version?: string;
      initiator?: string;
    },
  ): Promise<Chaincodebuild[]> {
    const labelSelector = [];
    if (labels?.id) {
      labelSelector.push(`bestchains.chaincodebuild.id=${labels.id}`);
    }
    if (labels?.network) {
      labelSelector.push(`bestchains.chaincodebuild.network=${labels.network}`);
    }
    if (labels?.version) {
      labelSelector.push(`bestchains.chaincodebuild.version=${labels.version}`);
    }
    if (labels?.initiator) {
      labelSelector.push(
        `bestchains.chaincodebuild.initiator=${labels.initiator}`,
      );
    }
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.chaincodeBuild.list({
      labelSelector: labelSelector.join(','),
    });
    return body.items.map((item) => this.format(item));
  }

  async createChaincodebuild(
    auth: JwtAuth,
    chaincodebuild: NewChaincodebuild,
  ): Promise<Chaincodebuild> {
    const { displayName, version, file, files, description, network } =
      chaincodebuild;
    const { name: initiator } = await this.selectInitiator(auth, network);

    // 1. ???????????????MinIO
    const exist = await this.minioService.bucketExists(MINIO_BUCKET_NAME);
    if (!exist) {
      await this.minioService.makeBucket(MINIO_BUCKET_NAME);
    }
    // TODO: ?????????????????? ?????????
    let objectName: string;
    if (file) {
      const { createReadStream, filename } = await file;
      objectName = filename;
      await this.minioService.putObject(
        MINIO_BUCKET_NAME,
        filename,
        createReadStream(),
      );
    }

    if (files) {
      const filestreams = await files;
      let isFirst = false;
      for (const filestream of filestreams) {
        const { createReadStream, filename } = await filestream;
        if (!isFirst) {
          objectName = filename?.split('/')[0];
          isFirst = true;
        }
        await this.minioService.putObject(
          MINIO_BUCKET_NAME,
          filename,
          createReadStream(),
        );
      }
    }

    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.chaincodeBuild.create({
      metadata: {
        name: genNanoid('chaincodebuild'),
      },
      spec: {
        license: {
          accept: true,
        },
        description,
        network,
        id: displayName,
        version,
        initiator,
        pipelineRunSpec: {
          minio: {
            bucket: MINIO_BUCKET_NAME,
            object: objectName,
          },
          dockerBuild: {
            appImage: `${this.imgConfig.namespace}/${displayName}:${version}`,
            context: `${MINIO_BUCKET_NAME}/${objectName}`,
            dockerfile: `${MINIO_BUCKET_NAME}/${objectName}/Dockerfile`,
            pushSecret: 'dockerhub-secret',
          },
        },
      },
    });
    return this.format(body);
  }

  async upgradeChaincodebuild(
    auth: JwtAuth,
    chaincodebuild: UpgradeChaincodebuild,
  ): Promise<Chaincodebuild> {
    const { displayName, newVersion, file, files, network } = chaincodebuild;
    const ccd = await this.createChaincodebuild(auth, {
      displayName,
      version: newVersion,
      file,
      files,
      network,
    });
    return ccd;
  }

  async deleteChaincodebuild(
    auth: JwtAuth,
    displayName: string,
    network: string,
  ): Promise<K8sV1Status[]> {
    // 1. ?????????????????????????????????Chaincode????????????
    const ccs = await this.chaincodeService.getChaincodes(auth, {
      id: displayName,
    });
    if (ccs && ccs.length > 0) {
      throw new ForbiddenException();
    }
    // 2. ????????????spec.id???displayName???chaincodebuild
    const ccbs = await this.getChaincodebuilds(auth, {
      id: displayName,
      network,
    });
    const k8s = await this.k8sService.getClient(auth);
    const results = await Promise.allSettled(
      ccbs.map((ccb) => k8s.chaincodeBuild.delete(ccb.name)),
    );
    return results.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value.body;
      } else {
        this.logger.error('Delete failed', result.reason?.body);
        return result.reason;
      }
    });
  }

  async selectInitiator(auth: JwtAuth, network: string): Promise<SpecMember> {
    const { members } = await this.networkService.getNetwork(auth, network);
    const { preferred_username } = auth;
    const memberlist = await this.orgService.getOrganizations(auth);
    const adminMembers = memberlist
      ?.filter((m) => m.admin === preferred_username)
      ?.map((m) => m.name);
    const clientMembers = memberlist
      ?.filter((m) => m.clients?.includes(preferred_username))
      ?.map((m) => m.name);
    const initiator =
      members?.find((m) => adminMembers.includes(m.name)) ||
      members?.find((m) => clientMembers.includes(m.name));
    return initiator;
  }
}
