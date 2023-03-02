import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  decodeBase64,
  DEFAULT_INGRESS_CLASS,
  DEFAULT_STORAGE_CLASS,
  genNanoid,
  OPERATOR_INGRESS_DOMAIN,
} from 'src/common/utils';
import imageConfig from 'src/config/image.config';
import { ConfigmapService } from 'src/configmap/configmap.service';
import { KubernetesService } from 'src/kubernetes/kubernetes.service';
import { CRD } from 'src/kubernetes/lib';
import { JwtAuth } from 'src/types';
import { Ibppeer } from './models/ibppeer.model';

@Injectable()
export class IbppeerService {
  constructor(
    private readonly k8sService: KubernetesService,
    private readonly cmService: ConfigmapService,
    @Inject(imageConfig.KEY)
    private imgConfig: ConfigType<typeof imageConfig>,
  ) {}

  format(ibppeer: CRD.IBPPeer): Ibppeer {
    return {
      name: ibppeer.metadata.name,
      creationTimestamp: new Date(
        ibppeer.metadata?.creationTimestamp,
      ).toISOString(),
      limits: ibppeer.spec?.resources?.peer?.limits,
      status: ibppeer.status?.type,
      namespace: ibppeer.metadata?.namespace,
      enrolluser: ibppeer.spec?.secret?.enrollment?.component?.enrolluser,
    };
  }

  async getIbppeers(auth: JwtAuth, org: string): Promise<Ibppeer[]> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.ibppeer.list(org);
    return body.items.map((item) => this.format(item));
  }

  async getIbppeer(auth: JwtAuth, org: string, name: string): Promise<Ibppeer> {
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.ibppeer.read(name, org);
    return this.format(body);
  }

  async createIbppeers(
    auth: JwtAuth,
    org: string,
    count = 1,
  ): Promise<Ibppeer[]> {
    return Promise.all(
      Array.from({ length: count }).map(() => this.createIbppeer(auth, org)),
    );
  }

  async createIbppeer(auth: JwtAuth, org: string): Promise<Ibppeer> {
    const { token, preferred_username } = auth;
    const { binaryData } = await this.cmService.getConfigmap(
      auth,
      `${org}-connection-profile`,
      org,
    );
    let cahost = '';
    let caport = '';
    let cacert = '';
    try {
      const data = decodeBase64(binaryData['profile.json']);
      const profile = JSON.parse(data || '{}');
      const regexp = /^(\w+):\/\/([^:]+)(?::(\d*))?$/;
      const proto = profile?.endpoints?.api?.replace(regexp, '$1');
      cahost = profile?.endpoints?.api?.replace(regexp, '$2');
      caport = profile?.endpoints?.api?.replace(regexp, '$3');
      cacert = profile?.tls?.cert;
      if (!caport && proto === 'http') {
        caport = '80';
      }
      if (!caport && proto === 'https') {
        caport = '443';
      }
    } catch (error) {}

    if (!cahost || !caport || !cacert) {
      throw new InternalServerErrorException(
        'Parameters cahost, caport and cacert are parsed incorrectly',
      );
    }

    const name = genNanoid(`${org}-peer`);
    const k8s = await this.k8sService.getClient(auth);
    const { body } = await k8s.ibppeer.create(org, {
      metadata: {
        name,
        namespace: org,
      },
      spec: {
        license: {
          accept: true,
        },
        mspID: org,
        domain: OPERATOR_INGRESS_DOMAIN,
        version: '2.4.7',
        ingress: {
          class: DEFAULT_INGRESS_CLASS,
        },
        secret: {
          enrollment: {
            component: {
              caname: 'ca',
              cahost,
              caport,
              catls: {
                cacert,
              },
              enrollid: name,
              enrollsecret: 'do-not-need',
              enrolluser: preferred_username,
              enrolltoken: token,
            },
            tls: {
              caname: 'tlsca',
              cahost,
              caport,
              catls: {
                cacert,
              },
              enrollid: name,
              enrollsecret: 'do-not-need',
              enrolluser: preferred_username,
              enrolltoken: token,
            },
          },
        },
        chaincodeBuilderConfig: {
          peername: name,
        },
        service: {
          type: 'ClusterIP',
        },
        stateDb: 'leveldb',
        storage: {
          peer: {
            class: DEFAULT_STORAGE_CLASS,
            size: '5G',
          },
          statedb: {
            class: DEFAULT_STORAGE_CLASS,
            size: '10Gi',
          },
        },
        resources: {
          init: {
            limits: {
              cpu: '100m',
              memory: '200Mi',
            },
            requests: {
              cpu: '10m',
              memory: '10Mi',
            },
          },
          peer: {
            limits: {
              cpu: '500m',
              memory: '1Gi',
            },
            requests: {
              cpu: '10m',
              memory: '10Mi',
            },
          },
          proxy: {
            limits: {
              cpu: '100m',
              memory: '200Mi',
            },
            requests: {
              cpu: '10m',
              memory: '10Mi',
            },
          },
        },
        images: {
          peerInitImage: `${this.imgConfig.namespace}/ubi-minimal`,
          peerInitTag: 'latest',
          grpcwebImage: `${this.imgConfig.namespace}/grpc-web`,
          grpcwebTag: 'latest',
          peerImage: `${this.imgConfig.namespace}/fabric-peer`,
          peerTag: this.imgConfig.repositories.fabricPeer.tag,
        },
      },
    });
    return this.format(body);
  }
}
