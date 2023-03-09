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
  server: 'https://172.22.96.146:9443',
  skipTLSVerify: true,
};
const user = {
  name: 'org1admin',
  token:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImYxOTFmYjFiNzY3M2JmNWJlMDFlMzM2OThkNDNmYjkxYmZkY2E4OTMifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuOTYuMjA5Lm5pcC5pby9vaWRjIiwic3ViIjoiQ2dsdmNtY3pZV1J0YVc0U0JtczRjMk55WkEiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjc4NDE2NzUzLCJpYXQiOjE2NzgzMzAzNTMsImF0X2hhc2giOiJrRUtaNFh4RkNvaUpvSDl0d2pUWWdRIiwiY19oYXNoIjoiSlhzelNGdW1nWDA1alc0VzlXSy1jZyIsImVtYWlsIjoib3JnM2FkbWluQHRlbnhjbG91ZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZ3JvdXBzIjpbInN5c3RlbTptYXN0ZXJzIiwiaWFtLnRlbnhjbG91ZC5jb20iLCJvYnNlcnZhYmlsaXR5IiwicmVzb3VyY2UtcmVhZGVyIiwib2JzZXZhYmlsaXR5IiwiYmVzdGNoYWlucyJdLCJuYW1lIjoib3JnM2FkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnM2FkbWluIiwicGhvbmUiOiIiLCJ1c2VyaWQiOiJvcmczYWRtaW4ifQ.TFCB1OESBmnJAKfmEgDDiF-YErv_NkITPy1zNKPtJv_n_vjolKwr2Ce6in__RC1oJDq9-A_8jY5uWqenuMJYvKgUVRs0J3ktMq4Fdnf-cP4422LuKdtXAkApuwLhRQAnVIIpvnYDMykrh5v6Zan3hRWGRo7c5e2bDZTjhURyMbwAogxb0JkFiKKy5JnCrCuF0xY1AnZMsRkXn79-yD8nvMpB-GzA5li8FIHgXQCC3PrjnbxJr-nAyE3nQa28LoS0S8dXSCGcw9eM_rcWHBVtI8aeE9UxYL_fviLHifkoOMXssmwAUmM2sS3VflVs7Y9yY_rwHiBKolcWoxJD-UoSkw',
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
