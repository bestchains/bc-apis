import * as fs from 'fs';
import { join } from 'path';
import * as k8s from '@kubernetes/client-node';
import {
  LIB_CRD_DIR,
  INTERFACES_CRD_DIR,
  INTERFACES_TEMPLATES_DIR,
  toKebabCase,
  processContentAndWriteFile,
  schemaToTs,
  writeRsImportsFile,
  RsImport,
} from './utils';

const CRD_LIST = [
  'applications.daas.tenxcloud.com',
  'users.iam.tenxcloud.com',
  'clusters.cluster.karmada.io',
  'federations.ibp.com',
  'organizations.ibp.com',
  'networks.ibp.com',
  'proposals.ibp.com',
  'votes.ibp.com',
  'ibpcas.ibp.com',
  'ibporderers.ibp.com',
  'ibppeers.ibp.com',
  'channels.ibp.com',
  'endorsepolicies.ibp.com',
  'chaincodes.ibp.com',
  'chaincodebuilds.ibp.com',
  'pipelineruns.tekton.dev',
];

const ClusterCrdTemplate = fs
  .readFileSync(join(LIB_CRD_DIR, 'user.ts'))
  .toString();
const NamespacedCrdTemplate = fs
  .readFileSync(join(LIB_CRD_DIR, 'application.ts'))
  .toString();
const CrdListInerfaceTemplate = fs
  .readFileSync(join(INTERFACES_TEMPLATES_DIR, 'user-list.ts'))
  .toString();

export const genCrd = async (kubeConfig: k8s.KubeConfig) => {
  const apiextensionsV1Api = kubeConfig.makeApiClient(k8s.ApiextensionsV1Api);
  const { body: crdList } =
    await apiextensionsV1Api.listCustomResourceDefinition();
  const crdSpecList = crdList.items
    .map((crd) => {
      const { kind, listKind, plural, singular } = crd.spec.names;
      return {
        name: crd.metadata.name,
        kind,
        listKind,
        plural,
        singular,
        scope: crd.spec.scope,
        group: crd.spec.group,
        // @Todo: 这里到底应该用哪个版本存疑？storedVersions？
        version: crd.spec.versions[crd.spec.versions.length - 1].name,
        schema:
          crd.spec.versions[crd.spec.versions.length - 1].schema
            ?.openAPIV3Schema,
      };
    })
    .filter((crd) => CRD_LIST.includes(crd.name));
  const rsImports: RsImport[] = [];
  const rsInterfaceImports: RsImport[] = [];
  for (const crdSpec of crdSpecList) {
    const { kind, listKind, scope, singular, plural, group, version, schema } =
      crdSpec;
    // gen crd interfaces
    let CrdInterface = '';
    if (!schema) {
      CrdInterface = await schemaToTs(undefined, kind, { unknownAny: false });
    } else {
      const { description, properties, type } = schema || {};
      CrdInterface = await schemaToTs(
        { description, properties, type } as any,
        kind,
        { unknownAny: false },
      );
    }
    const crdFileName = toKebabCase(kind);
    const crdListFileName = toKebabCase(listKind);
    rsInterfaceImports.push({
      rs: kind,
      fileName: crdFileName,
    });
    rsInterfaceImports.push({
      rs: listKind,
      fileName: crdListFileName,
    });
    processContentAndWriteFile(
      kind,
      join(INTERFACES_CRD_DIR, toKebabCase(kind) + '.ts'),
      CrdInterface,
    );
    processContentAndWriteFile(
      listKind,
      join(INTERFACES_CRD_DIR, crdListFileName + '.ts'),
      CrdListInerfaceTemplate.replace(/user/g, crdFileName)
        .replace(/User/g, kind)
        .replace(/UserList/g, listKind),
    );
    // gen crd class
    rsImports.push({
      rs: kind,
      fileName: crdFileName,
    });
    if (scope === 'Cluster' && kind !== 'User') {
      console.log('[CRD] Cluster =>', kind);
      processContentAndWriteFile(
        kind,
        join(LIB_CRD_DIR, crdFileName + '.ts'),
        ClusterCrdTemplate.replace(/User/g, kind)
          .replace(/USER/g, crdFileName.replace(/\-/g, '_').toUpperCase())
          .replace(/UserList/g, listKind)
          .replace("kind: 'User'", `kind: '${kind}'`)
          .replace("listKind: 'UserList'", `listKind: '${listKind}'`)
          .replace("plural: 'users'", `plural: '${plural}'`)
          .replace("singular: 'user'", `singular: '${singular}'`)
          .replace("group: 'iam.tenxcloud.com'", `group: '${group}'`)
          .replace("version: 'v1alpha1'", `version: '${version}'`),
      );
    }
    if (scope === 'Namespaced' && kind !== 'Application') {
      console.log('[CRD] Namespaced =>', kind);
      processContentAndWriteFile(
        kind,
        join(LIB_CRD_DIR, crdFileName + '.ts'),
        NamespacedCrdTemplate.replace(/Application/g, kind)
          .replace(
            /APPLICATION/g,
            crdFileName.replace(/\-/g, '_').toUpperCase(),
          )
          .replace(/ApplicationList/g, listKind)
          .replace("kind: 'Application'", `kind: '${kind}'`)
          .replace("listKind: 'ApplicationList'", `listKind: '${listKind}'`)
          .replace("plural: 'applications'", `plural: '${plural}'`)
          .replace("singular: 'application'", `singular: '${singular}'`)
          .replace("group: 'daas.tenxcloud.com'", `group: '${group}'`)
          .replace("version: 'v1'", `version: '${version}'`),
      );
    }
  }
  writeRsImportsFile(join(INTERFACES_CRD_DIR, 'index.ts'), rsInterfaceImports);
  writeRsImportsFile(join(LIB_CRD_DIR, 'index.ts'), rsImports);
  return rsImports;
};
