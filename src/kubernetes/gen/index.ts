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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFjMTU1YTk3ZDQzMDlhNjc0YTU5ZTJlYTA2ODk4ODA5NmI1N2E1NzYifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuNTAuMTQyLm5pcC5pby9vaWRjIiwic3ViIjoiQ2dsdmNtY3pZV1J0YVc0U0JtczRjMk55WkEiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjc1NDc5MTU1LCJpYXQiOjE2NzUzOTI3NTUsImF0X2hhc2giOiJkd3k5bkFiV2d2NndWdzJlcXpPaGRnIiwiY19oYXNoIjoiaGRYUTh5TFBZQnBXaDdJVFItNzlrQSIsImVtYWlsIjoib3JnM2FkbWluQHRlbnhjbG91ZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZ3JvdXBzIjpbIm9ic2VydmFiaWxpdHkiLCJzeXN0ZW06bm9kZXMiLCJzeXN0ZW06bWFzdGVycyIsInJlc291cmNlLXJlYWRlciIsImlhbS50ZW54Y2xvdWQuY29tIiwib2JzZXJ2YWJpbGl0eSJdLCJuYW1lIjoib3JnM2FkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnM2FkbWluIiwicGhvbmUiOiIiLCJ1c2VyaWQiOiJvcmczYWRtaW4ifQ.AYFn8b_mwBmZsLoDcz8serhK6uU5E76E7D2StjKbtiMMdrTWJIuIlmAGFccPuSDPZxizCK75nPIo4odLa7fx5Z9o8PcDw7FL_eHbf4LhCc_soERNLlfDP82IhEisg0uwtDbWuzooCAj8QSLkFZ4LWNYfaSmfC-PYLQZ1vxoo9yHB9AzHH-2FSGkaiRwY2PWacy1LaWv8VZTvIb0gvAqKIFu9eebETkBgA12HR8oClwaM-hXIy5Mc-ujq_Ph8xtAggU7Ky7mI8huMnvdXZ61_QCutqHYqMA1p6ajstUcWQEvk4hzHySJLIlQSBnhROgaolsPrlouB-Qc8O_FO42mKwQ',
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
