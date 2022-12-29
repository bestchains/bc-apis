/**
  * 由 src/kubernetes/gen/index.ts 自动生成
 * !!! 请不要修改 !!!
 */
/**
 * 模板
 * 用作 namespaced crd 资源 class 生成
 */

import { Logger } from '@nestjs/common';
import http from 'http';
import * as K8s from '@kubernetes/client-node';
import {
  CreateOptions,
  PatchOptions,
  JsonPatchOp,
  DeleteOptions,
  DeleteCollectionOptions,
  ReadOptions,
  ListOptions,
  CRD,
} from '../interfaces';
import {
  JSON_PATCH_CONTENT_TYPE,
  MERGE_PATCH_CONTENT_TYPE,
  STRATEGIC_MERGE_PATCH_CONTENT_TYPE,
} from '../utils/constants';

export const I_B_P_C_A_CRD_SPEC = {
  kind: 'IBPCA',
  listKind: 'IBPCAList',
  plural: 'ibpcas',
  singular: 'ibpca',
  scope: 'Namespaced',
  group: 'ibp.com',
  version: 'v1beta1',
};

const { kind, group, version, plural } = I_B_P_C_A_CRD_SPEC;
const DEFAULT_BODY = {
  kind,
  apiVersion: `${group}/${version}`,
};

/**
 * @category crd
 */
export class IBPCA {
  constructor(private readonly k8sApi: K8s.CustomObjectsApi) {}

  kind = kind;
  name = plural;
  namespaced = true;
  group = group;
  version = version;
  logger = new Logger(this.kind);

  debug(message: string, ...optionalParams: [...any, string?]) {
    const paramsLog =
      optionalParams?.filter((param) => param).length > 0
        ? JSON.stringify(optionalParams)
        : '-';
    this.logger.debug(`${message} ${paramsLog}`);
  }

  /**
   * 创建 IBPCA
   *
   * @param {string} namespace 命名空间
   * @param {CRD.IBPCA} body IBPCA 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  create(namespace: string, body: CRD.IBPCA, options?: CreateOptions) {
    this.debug('[create]', body, options);
    const { pretty, dryRun, fieldManager, headers } = options || {};
    return this.k8sApi.createNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      Object.assign({}, DEFAULT_BODY, body),
      pretty,
      dryRun,
      fieldManager,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 替换指定的 IBPCA
   *
   * @param {string} name IBPCA 名称
   * @param {string} namespace 命名空间
   * @param {CRD.IBPCA} body IBPCA 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  replace(
    name: string,
    namespace: string,
    body: CRD.IBPCA,
    options?: CreateOptions,
  ) {
    this.debug(`[replace] ns:${namespace} => ${name}`, body, options);
    const { dryRun, fieldManager, headers } = options || {};
    return this.k8sApi.replaceNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      name,
      Object.assign({}, DEFAULT_BODY, body),
      dryRun,
      fieldManager,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 部分更新指定的 IBPCA (JSON Patch)
   *
   * @param {string} name IBPCA 名称
   * @param {string} namespace 命名空间
   * @param {JsonPatchOp[]} body IBPCA 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patch(
    name: string,
    namespace: string,
    body: JsonPatchOp[],
    options?: PatchOptions,
  ) {
    this.debug(`[patch] ns:${namespace} => ${name}`, body, options);
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      name,
      body,
      dryRun,
      fieldManager,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': JSON_PATCH_CONTENT_TYPE,
        }),
      },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 部分更新指定的 IBPCA (Merge Patch)
   *
   * @param {string} name IBPCA 名称
   * @param {string} namespace 命名空间
   * @param {object} body IBPCA 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchMerge(
    name: string,
    namespace: string,
    body: object,
    options?: PatchOptions,
  ) {
    this.debug(`[patchMerge] ns:${namespace} => ${name}`, body, options);
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      name,
      body,
      dryRun,
      fieldManager,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': MERGE_PATCH_CONTENT_TYPE,
        }),
      },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 部分更新指定的 IBPCA (Strategic Merge Patch)
   *
   * @param {string} name IBPCA 名称
   * @param {string} namespace 命名空间
   * @param {object} body IBPCA 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchStrategicMerge(
    name: string,
    namespace: string,
    body: object,
    options?: PatchOptions,
  ) {
    this.debug(
      `[patchStrategicMerge] ns:${namespace} => ${name}`,
      body,
      options,
    );
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      name,
      body,
      dryRun,
      fieldManager,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': STRATEGIC_MERGE_PATCH_CONTENT_TYPE,
        }),
      },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 根据名称删除一个  IBPCA
   *
   * @param {string} name IBPCA 名称
   * @param {string} namespace 命名空间
   * @param {DeleteOptions} [options] 可选配置项
   */
  delete(name: string, namespace: string, options?: DeleteOptions) {
    this.debug(`[delete] ns:${namespace} => ${name}`, options);
    const {
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      name,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      dryRun,
      body,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 根据选择器删除多个 IBPCA
   *
   * @param {string} namespace 命名空间
   * @param {DeleteCollectionOptions} [options] 可选配置项
   */
  deleteCollection(namespace: string, options?: DeleteCollectionOptions) {
    this.debug(`[deleteCollection] ns:${namespace}`, options);
    const {
      pretty,
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteCollectionNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      pretty,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      dryRun,
      body,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: K8s.V1Status;
    }>;
  }

  /**
   * 根据名称获取 IBPCA 详情 (指定 namespace 下)
   *
   * @param {string} name IBPCA 名称
   * @param {string} namespace 命名空间
   * @param {ListOptions} [options] 可选配置项
   */
  read(name: string, namespace: string, options?: ReadOptions) {
    this.debug(`[read] ns:${namespace} => ${name}`, options);
    const { headers } = options || {};
    return this.k8sApi.getNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      name,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCA;
    }>;
  }

  /**
   * 列取 IBPCA 列表
   *
   * @param {string} namespace 命名空间
   * @param {ListOptions} [options] 可选配置项
   */
  list(namespace: string, options?: ListOptions) {
    this.debug(`[list] ns:${namespace}`, options);
    const {
      pretty,
      allowWatchBookmarks,
      _continue,
      fieldSelector,
      labelSelector,
      limit,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      watch,
      headers,
    } = options || {};
    return this.k8sApi.listNamespacedCustomObject(
      group,
      version,
      namespace,
      plural,
      pretty,
      allowWatchBookmarks,
      _continue,
      fieldSelector,
      labelSelector,
      limit,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      watch,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.IBPCAList;
    }>;
  }
}
