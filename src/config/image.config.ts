import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('image', () => ({
  namespace: env.IMAGE_NAMESPACE || 'hyperledgerk8s',
  repositories: {
    fabricCA: {
      tag: env.IMAGE_FABRIC_CA_TAG || '1.5.5-iam',
    },
  },
}));
