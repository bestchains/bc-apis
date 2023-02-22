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
    'eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzZWYxMmEzNDllM2QxMmQxZmExOWVhNjFhNDZiY2U4ODViNDkyYjQifQ.eyJpc3MiOiJodHRwczovL3BvcnRhbC4xNzIuMjIuOTYuMjA5Lm5pcC5pby9vaWRjIiwic3ViIjoiQ2dsdmNtY3hZV1J0YVc0U0JtczRjMk55WkEiLCJhdWQiOiJiZmYtY2xpZW50IiwiZXhwIjoxNjc2OTcwMDU3LCJpYXQiOjE2NzY4ODM2NTcsImF0X2hhc2giOiJsSllDREhnME5XR1N3TmxYZUZBVjJRIiwiY19oYXNoIjoiUlplLWVoOE9wSEFpRzc5Q1hQVjFZdyIsImVtYWlsIjoib3JnMWFkbWluQHRlbnhjbG91ZC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZ3JvdXBzIjpbIm9ic2VydmFiaWxpdHkiLCJzeXN0ZW06bm9kZXMiLCJzeXN0ZW06bWFzdGVycyIsInJlc291cmNlLXJlYWRlciIsImlhbS50ZW54Y2xvdWQuY29tIiwib2JzZXZhYmlsaXR5IiwiYmVzdGNoYWlucyJdLCJuYW1lIjoib3JnMWFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3JnMWFkbWluIiwicGhvbmUiOiIiLCJ1c2VyaWQiOiJvcmcxYWRtaW4ifQ.Ou58kpKaynbbs4JklccSfvw2r7FRDeHqXBoVjNf9dT4f0WObbIXSXz57z7jUl1jPpd4MFdP1ppeBIqSQAVKpWH8XiucNweR1NXtrBSXvwF4b6k-sZvX5y5EAhEL2lVtFvvOWVu7k-XPC-x8jF00GyoFPrW_BwdghKZJcccYC4SgzCE0SwQ_o3NAIyzsImfIYghfa12cjkG9o-EYSIBm61gdb0IDYFm1iC4PLBcBI_1-BYUJTAKgPLA-lghM7Ft3pQz94lgk1ZuG7VtzywVp2JwIZsPt8cuWKEudtMNWgTf1G8LIDXRIGosI9Pd1DVojUk3hCvhdWq57PgSIMIUbJGA',
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
