import { registerAs } from '@nestjs/config';
import { IS_PROD } from 'src/common/utils/constants';

const { env } = process;

export default registerAs('oidc', () => ({
  server: {
    url:
      env.DEX_SERVER_URL ||
      (IS_PROD
        ? 'http://oidc-server:5556/oidc' // 生产环境
        : 'https://portal.172.22.50.142.nip.io/oidc'), // 本地调试 172.31.235.225:5556
    rootSecretToken: ``,
  },
  connector: {
    id: env.DEX_CONNECTOR_ID || 'k8scrd',
  },
}));
