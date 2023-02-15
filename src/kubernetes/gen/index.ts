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
  server: 'https://172.22.96.149:9443',
  skipTLSVerify: true,
};
const user = {
  name: 'admin',
  token:
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjVlMmE3OTJjZGE2MTU3YzEwNjRhMDgwZThhNGMwNzU4OWY5ZDUxYWIifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuOTYuMjA5Lm5pcC5pby9vaWRjIiwic3ViIjoiQ2dWaFpHMXBiaElHYXpoelkzSmsiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjc2MzU5OTQxLCJpYXQiOjE2NzYyNzM1NDEsImF0X2hhc2giOiJJOFB3MkNQM2d2NUhpdWpOYUN6S053IiwiY19oYXNoIjoiY2tOUjlQcmJ4MFJrLWJWZjkxeThvUSIsImVtYWlsIjoiYWRtaW5AdGVueGNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJncm91cHMiOlsic3lzdGVtOm1hc3RlcnMiLCJpYW0udGVueGNsb3VkLmNvbSIsIm9ic2VydmFiaWxpdHkiLCJyZXNvdXJjZS1yZWFkZXIiXSwibmFtZSI6ImFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4iLCJwaG9uZSI6IiIsInVzZXJpZCI6ImFkbWluIn0.C0V8RYj4nSikySXUW-NWhH6dAhbeViBijHNtqPnO2WfD8sL_R5J4kDRBccjDPp21Rlo91AW7W9pzH0IBXO9nFkQ6MNrVICDnj4IP6QrxXX2RtDdQEXo0XYoKdHFTM94EPbofXDnusZhM9UTJqgWsZcbEFxO1YCGJ0iXJfQnLVBe3aFmemYUkUh3uJXrlAsBwsGoOa5wrZlag94eolUuJs3-12-zPoQIM7H-UZ2l2E1ALgwOCZ6sR1W5doOg1u7kPj0futDm6i6AzMcPi2h__Bv-TruWiUn2dvZC4ozdRwWQD5NaQpds-qMp3bC5Ft0Y_ZiGpmJlbl2BuB9ywdPXARA',
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
