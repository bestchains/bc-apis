import { OrderVersion } from 'src/network/dto/order-version.enum';

const { env } = process;

export const IS_PROD = env.NODE_ENV === 'production';

export const LOG_LEVELS = env.LOG_LEVELS || 'log,error,warn';

export const DEFAULT_STORAGE_CLASS = env.DEFAULT_STORAGE_CLASS;

export const DEFAULT_INGRESS_CLASS = env.DEFAULT_INGRESS_CLASS;

/** k8s 注入到 pod 中的 service account token 路径 */
export const K8S_SA_TOKEN_PATH =
  '/var/run/secrets/kubernetes.io/serviceaccount/token';
export const OIDC_SERVER_ROOT_SECRET_PATH = '/etc/oidc-server/ca.crt';

export const SECRET_CLUSTER_SYSTEM_NAMESPACE =
  env.SECRET_CLUSTER_SYSTEM_NAMESPACE || 'cluster-system';

export const SECRET_CLUSTER_CONFIGS_NAMESPACE =
  env.SECRET_CLUSTER_CONFIGS_NAMESPACE || 'u4a-system';

export const SECRET_CLUSTER_CONFIGS_NAME = 'cluster-configs';

export const NETWORK_VERSION_RESOURCES = {
  [OrderVersion.Standard]: ['4', '8Gi', '100m', '200Mi', '200Gi'],
  [OrderVersion.Enterprise]: ['8', '16Gi', '100m', '200Mi', '500Gi'],
  [OrderVersion.Finance]: ['16', '32Gi', '16', '32Gi', '1000Gi'],
};
