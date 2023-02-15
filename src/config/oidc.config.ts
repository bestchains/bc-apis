import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('oidc', () => ({
  server: {
    // 这里填写 bff-server 的配置
    url: env.OIDC_SERVER_URL || 'https://portal.172.22.96.209.nip.io/oidc',
  },
  client: {
    // 这里填写 oidc client 的配置
    client_id: env.OIDC_SERVER_CLIENT_ID || 'bff-client',
    client_secret:
      env.OIDC_SERVER_CLIENT_SECRET || '61324af0-1234-4f61-b110-ef57013267d6',
  },
}));
