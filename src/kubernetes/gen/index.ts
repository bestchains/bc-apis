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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZhMjcwYWNlYWE5YTc2NzMzNjZlOTAyZjI3MmE3NmFmZTJjNDc1YTIifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuNTAuMTQyLm5pcC5pby9vaWRjIiwic3ViIjoiQ2dWaFpHMXBiaElHYXpoelkzSmsiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjcxNjkxNTUzLCJpYXQiOjE2NzE2MDUxNTMsImF0X2hhc2giOiJMTmNxaTJkVXlCM0JyVFdvTVpSNVNnIiwiY19oYXNoIjoiRW13dGlWQWFDWGx1bDdwcTdTaGlUUSIsImVtYWlsIjoiYWRtaW5AdGVueGNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cHMiOlsic3lzdGVtOm1hc3RlcnMiLCJpYW0udGVueGNsb3VkLmNvbSIsIm9ic2VydmFiaWxpdHkiLCJyZXNvdXJjZS1yZWFkZXIiXSwibmFtZSI6ImFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJwaG9uZSI6IiIsInVzZXJpZCI6ImFkbWluIn0.ApYb2VcncaPe0BJv0JBVlZ3dmqfeJV8E7ObWnVdBrYm7ccg3USKeH8gTbMM-4XkMnugv8zhpxtkWzXrJnK2CToQDx5o9dg-munvcTVcaU2JkQxfvFMktgdCxeKuwx6p26k5h5-jZDkZgl8HhCDhJgolGwU5j3bPIi7nBOwWBwDGeoOJbtykIG24GnXc-lOGa595nNuju9x_19GdyKa7qNBafDNVd9EzCrxT0Z3tSnlOF6hpnlUI_gY8Yjl0XWdHxV9DDPFrY0PMSvNgrs_hoxivpYtFUjngIW9JA7eecgEds8UTyC-8WWEQfddNLjAZ1R16fZW5oHCooib9Oic27oQ',
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
