import * as fs from 'fs';
import { join } from 'path';
import * as k8s from '@kubernetes/client-node';
import { genCore } from './core';
import { genCrd } from './crd';
import { genRbac } from './rbac';
import { genApps } from './apps';
import { genBatch } from './batch';
import { getRegExp, ROOT_DIR, firstLetterToLowercase, RsImport } from './utils';

const cluster = {
  name: 'kube-oidc-proxy',
  server: 'https://172.22.50.245',
  skipTLSVerify: true,
};
const user = {
  name: 'admin',
  token:
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdhZjZiYTcyNjk2MDc1MGZiOTM5YTA0ZDA4NTMxM2RkZjk5MzQ4MTQifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuNTAuMTQyLm5pcC5pby9vaWRjIiwic3ViIjoiQ2dWaFpHMXBiaElHYXpoelkzSmsiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjcyMjkwODI4LCJpYXQiOjE2NzIyMDQ0MjgsImF0X2hhc2giOiJOdHM0clFhbC1lbFBUQWpvRmVnNmJRIiwiY19oYXNoIjoiLXRHRzJzaDlIZ09BQXEzVi1jTEs2QSIsImVtYWlsIjoiYWRtaW5AdGVueGNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cHMiOlsic3lzdGVtOm1hc3RlcnMiLCJpYW0udGVueGNsb3VkLmNvbSIsIm9ic2VydmFiaWxpdHkiLCJyZXNvdXJjZS1yZWFkZXIiXSwibmFtZSI6ImFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJwaG9uZSI6IiIsInVzZXJpZCI6ImFkbWluIn0.HG2nPD4dHzb4WFV4Edx2oKalir_womAMXlpSzSOF5axfaaDcYcBs0b1qpk75ZNOZoO7WlDfNMPqISoK136ywMN8IiTS-MFT-YtUzMs2MfJZ8FnSmFXtpA4lzqFS3SbKCk26He9nGDeq48D-9Ao0suhW2yCev2HTIuLwCzvms5YnUwjED6pARY0qK2GcGq77s3NyBysHc6JWCbIVYrXBEaXOdwDw48MGKRJY5kypiiV0Ngyeq4gbhZYq1wuMCL4Ix5U7vHcYHS1q0J90n9SkruF0avlwH7Ztaye4EQRXh4r98wp4KTEQ62HLeFE6UMusrhgGqRYyq5JJUHi4h90ucCQ"
};
const createKubeConfig = (cluster: k8s.Cluster, user: k8s.User) => {
  const kubeConfig = new k8s.KubeConfig();
  kubeConfig.loadFromClusterAndUser(cluster, user);
  return kubeConfig;
};
const kubeConfig = createKubeConfig(cluster, user);

const K8S_SERVICE_PATH = join(ROOT_DIR, 'kubernetes.service.ts');
let K8sServiceContent = fs.readFileSync(K8S_SERVICE_PATH).toString();
const replaceK8sServiceContent = (
  rsImports: RsImport[],
  group = 'core',
  apiClientType = 'coreV1Api',
) => {
  K8sServiceContent = K8sServiceContent.replace(
    getRegExp(`<replace type="${group}">`, `</replace type="${group}">`),
    `// <replace type="${group}">\n${rsImports
      .map(
        ({ rs }) =>
          `${firstLetterToLowercase(rs)}: new lib.${rs}(${apiClientType})`,
      )
      .join(',\n')},\n// </replace type="${group}">`,
  );
  fs.writeFileSync(K8S_SERVICE_PATH, K8sServiceContent);
};

async function gen() {
  // gen core v1 rs
  const coreRsImports = await genCore(kubeConfig);
  replaceK8sServiceContent(coreRsImports, 'core', 'coreV1Api');

  // gen crd
  const crdRsImports = await genCrd(kubeConfig);
  replaceK8sServiceContent(crdRsImports, 'crd', 'customObjectsApi');

  // gen rbac v1 rs
  const rbacRsImports = await genRbac(kubeConfig);
  replaceK8sServiceContent(rbacRsImports, 'rbac', 'rbacAuthorizationV1Api');

  // gen apps v1 rs
  const appsRsImports = await genApps(kubeConfig);
  replaceK8sServiceContent(appsRsImports, 'apps', 'appsV1Api');

  // gen apps v1 rs
  const batchRsImports = await genBatch(kubeConfig);
  replaceK8sServiceContent(batchRsImports, 'batch', 'batchV1Api');
}

gen();
