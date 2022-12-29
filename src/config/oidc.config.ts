import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('oidc', () => ({
  server: {
    // 这里填写 bff-server 的配置
    url: env.OIDC_SERVER_URL || 'https://portal.172.22.50.142.nip.io/oidc',
  },
  client: {
    // 这里填写 oidc client 的配置
    client_id: env.OIDC_SERVER_CLIENT_ID || 'bc-client',
    client_secret: env.OIDC_SERVER_CLIENT_SECRET || 'bc-secret',
    redirect_uri: env.OIDC_REDIRECT_URL || 'http://localhost:8000', // 控制台host
  },
}));
