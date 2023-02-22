import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('image', () => ({
  namespace: env.IMAGE_NAMESPACE || '172.22.50.223/bestchains-dev',
  repositories: {
    fabricCA: {
      tag: env.IMAGE_FABRIC_CA_TAG || 'iam-20230131',
    },
    fabricOrderer: {
      tag: env.IMAGE_FABRIC_ORDERER_TAG || '2.4.7',
    },
    fabricPeer: {
      tag: env.IMAGE_FABRIC_PEER_TAG || '2.4.7-external',
    },
  },
}));
