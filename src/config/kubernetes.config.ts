import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('kubernetes', () => ({
  cluster: {
    name: env.K8S_SERVER_NAME || 'kube-oidc-proxy',
    server: env.K8S_OIDC_PROXY_URL || 'https://172.22.96.146:9443',
    skipTLSVerify: true,
  },
  /** bff-server 自己的 service account token，仅开发时使用，生产环境时会从 k8s 注入的 sa 文件中读取*/
  bffSaToken: '',
  /** 集群相关配置，例如 es 等配置，仅用于开发调试，生产环境会从挂载的 cluster-configs secrets 中读取 */
  clusterConfigs: {
    // 'es-cid-585ae638bd68': {
    //   userName: 'elastic',
    //   password: 'admin123',
    // },
  },
}));
