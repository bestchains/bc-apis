/**
  * 由 src/kubernetes/gen/index.ts 自动生成
 * !!! 请不要修改 !!!
 */


import { Logger } from '@nestjs/common';
import * as K8s from '@kubernetes/client-node';
import {
  CreateOptions,
  PatchOptions,
  JsonPatchOp,
  DeleteOptions,
  DeleteCollectionSelectors,
  DeleteCollectionOptions,
  ReadOptions,
  ListOptions,
} from '../interfaces';
import {
  JSON_PATCH_CONTENT_TYPE,
  MERGE_PATCH_CONTENT_TYPE,
  STRATEGIC_MERGE_PATCH_CONTENT_TYPE,
} from '../utils/constants';

/**
 * @category apps
 */
export class ControllerRevision {
  constructor(private readonly k8sApi: K8s.AppsV1Api) {}

  kind = 'ControllerRevision';
  name = 'controllerrevisions';
  namespaced = true;
  group = 'apps'; version = 'v1';
  logger = new Logger(this.kind);

  debug(message: string, ...optionalParams: [...any, string?]) {
    const paramsLog =
      optionalParams?.filter((param) => param).length > 0
        ? JSON.stringify(optionalParams)
        : '-';
    this.logger.debug(`${message} ${paramsLog}`);
  }

  /**
   * 创建 ControllerRevision
   *
   * @param {string} namespace 命名空间
   * @param {K8s.V1ControllerRevision} body ControllerRevision 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  create(namespace: string, body: K8s.V1ControllerRevision, options?: CreateOptions) {
    this.debug('[create]', body, options);
    const { pretty, dryRun, fieldManager, fieldValidation, headers } =
      options || {};
    return this.k8sApi.createNamespacedControllerRevision(
      namespace,
      body,
      pretty,
      dryRun,
      fieldManager,
      fieldValidation,
      { headers },
    );
  }

  /**
   * 替换指定的 ControllerRevision
   *
   * @param {string} name ControllerRevision 名称
   * @param {string} namespace 命名空间
   * @param {K8s.V1ControllerRevision} body ControllerRevision 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  replace(
    name: string,
    namespace: string,
    body: K8s.V1ControllerRevision,
    options?: CreateOptions,
  ) {
    this.debug(`[replace] ns:${namespace} => ${name}`, body, options);
    const { pretty, dryRun, fieldManager, fieldValidation, headers } =
      options || {};
    return this.k8sApi.replaceNamespacedControllerRevision(
      name,
      namespace,
      body,
      pretty,
      dryRun,
      fieldManager,
      fieldValidation,
      { headers },
    );
  }

  /**
   * 部分更新指定的 ControllerRevision (JSON Patch)
   *
   * @param {string} name ControllerRevision 名称
   * @param {string} namespace 命名空间
   * @param {JsonPatchOp[]} body ControllerRevision 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patch(
    name: string,
    namespace: string,
    body: JsonPatchOp[],
    options?: PatchOptions,
  ) {
    this.debug(`[patch] ns:${namespace} => ${name}`, body, options);
    const { pretty, dryRun, fieldManager, fieldValidation, force, headers } =
      options || {};
    return this.k8sApi.patchNamespacedControllerRevision(
      name,
      namespace,
      body,
      pretty,
      dryRun,
      fieldManager,
      fieldValidation,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': JSON_PATCH_CONTENT_TYPE,
        }),
      },
    );
  }

  /**
   * 部分更新指定的 ControllerRevision (Merge Patch)
   *
   * @param {string} name ControllerRevision 名称
   * @param {string} namespace 命名空间
   * @param {object} body ControllerRevision 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchMerge(
    name: string,
    namespace: string,
    body: object,
    options?: PatchOptions,
  ) {
    this.debug(`[patchMerge] ns:${namespace} => ${name}`, body, options);
    const { pretty, dryRun, fieldManager, fieldValidation, force, headers } =
      options || {};
    return this.k8sApi.patchNamespacedControllerRevision(
      name,
      namespace,
      body,
      pretty,
      dryRun,
      fieldManager,
      fieldValidation,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': MERGE_PATCH_CONTENT_TYPE,
        }),
      },
    );
  }

  /**
   * 部分更新指定的 ControllerRevision (Strategic Merge Patch)
   *
   * @param {string} name ControllerRevision 名称
   * @param {string} namespace 命名空间
   * @param {object} body ControllerRevision 对象
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
    const { pretty, dryRun, fieldManager, fieldValidation, force, headers } =
      options || {};
    return this.k8sApi.patchNamespacedControllerRevision(
      name,
      namespace,
      body,
      pretty,
      dryRun,
      fieldManager,
      fieldValidation,
      force,
      {
        headers: Object.assign({}, headers, {
          'Content-Type': STRATEGIC_MERGE_PATCH_CONTENT_TYPE,
        }),
      },
    );
  }

  /**
   * 根据名称删除一个 ControllerRevision
   *
   * @param {string} name ControllerRevision 名称
   * @param {string} namespace 命名空间
   * @param {DeleteOptions} [options] 可选配置项
   */
  delete(name: string, namespace: string, options?: DeleteOptions) {
    this.debug(`[delete] ns:${namespace} => ${name}`, options);
    const {
      pretty,
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteNamespacedControllerRevision(
      name,
      namespace,
      pretty,
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      { headers },
    );
  }

  // <remove is="Service">
  /**
   * 根据选择器删除多个 ControllerRevision
   *
   * @param {string} namespace 命名空间
   * @param {DeleteCollectionSelectors} [selectors] 选择器
   * @param {DeleteCollectionOptions} [options] 可选配置项
   */
  deleteCollection(
    namespace: string,
    selectors?: DeleteCollectionSelectors,
    options?: DeleteCollectionOptions,
  ) {
    this.debug(`[deleteCollection] ns:${namespace}`, selectors, options);
    const { fieldSelector, labelSelector } = selectors;
    const {
      pretty,
      _continue,
      dryRun,
      gracePeriodSeconds,
      limit,
      orphanDependents,
      propagationPolicy,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteCollectionNamespacedControllerRevision(
      namespace,
      pretty,
      _continue,
      dryRun,
      fieldSelector,
      gracePeriodSeconds,
      labelSelector,
      limit,
      orphanDependents,
      propagationPolicy,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      body,
      { headers },
    );
  }
  // </remove is="Service">

  /**
   * 根据名称获取 ControllerRevision 详情 (指定 namespace 下)
   *
   * @param {string} namespace 命名空间
   * @param {ListOptions} [options] 可选配置项
   */
  read(name: string, namespace: string, options?: ReadOptions) {
    this.debug(`[read] ns:${namespace} => ${name}`, options);
    const { pretty, headers } = options || {};
    return this.k8sApi.readNamespacedControllerRevision(name, namespace, pretty, { headers });
  }

  /**
   * 列取 ControllerRevision 列表
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
    return this.k8sApi.listNamespacedControllerRevision(
      namespace,
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
    );
  }

  /**
   * 列取 ControllerRevision 列表 (所有 namespace 下)
   *
   * @param {ListOptions} [options] 可选配置项
   */
  listAll(options?: ListOptions) {
    this.debug('[listAll]', options);
    const {
      allowWatchBookmarks,
      _continue,
      fieldSelector,
      labelSelector,
      limit,
      pretty,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      watch,
      headers,
    } = options || {};
    return this.k8sApi.listControllerRevisionForAllNamespaces(
      allowWatchBookmarks,
      _continue,
      fieldSelector,
      labelSelector,
      limit,
      pretty,
      resourceVersion,
      resourceVersionMatch,
      timeoutSeconds,
      watch,
      { headers },
    );
  }
}
