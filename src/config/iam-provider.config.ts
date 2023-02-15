import { registerAs } from '@nestjs/config';
import { IS_PROD } from 'src/common/utils';

const { env } = process;

export default registerAs('iamProvider', () => ({
  server: {
    url:
      env.IAM_PROVIDER_URL ||
      (IS_PROD ? 'https://oidc-server' : 'http://iam.172.22.96.209.nip.io'),
  },
}));
