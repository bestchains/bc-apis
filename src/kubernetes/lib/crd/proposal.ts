/**
  * 由 src/kubernetes/gen/index.ts 自动生成
 * !!! 请不要修改 !!!
 */
/**
 * 模板
 * 用作 cluster crd 资源 class 生成
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

export const PROPOSAL_CRD_SPEC = {
  kind: 'Proposal',
  listKind: 'ProposalList',
  plural: 'proposals',
  singular: 'proposal',
  scope: 'Cluster',
  group: 'ibp.com',
  version: 'v1beta1',
};

const { kind, group, version, plural } = PROPOSAL_CRD_SPEC;
const DEFAULT_BODY = {
  kind,
  apiVersion: `${group}/${version}`,
};

/**
 * @category crd
 */
export class Proposal {
  constructor(private readonly k8sApi: K8s.CustomObjectsApi) {}

  kind = kind;
  name = plural;
  namespaced = false;
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
   * 创建 Proposal
   *
   * @param {CRD.Proposal} body Proposal 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  create(body: CRD.Proposal, options?: CreateOptions) {
    this.debug('[create]', body, options);
    const { pretty, dryRun, fieldManager, headers } = options || {};
    return this.k8sApi.createClusterCustomObject(
      group,
      version,
      plural,
      Object.assign({}, DEFAULT_BODY, body),
      pretty,
      dryRun,
      fieldManager,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.Proposal;
    }>;
  }

  /**
   * 替换指定的 Proposal
   *
   * @param {string} name Proposal 名称
   * @param {CRD.Proposal} body Proposal 对象
   * @param {CreateOptions} [options] 可选配置项
   */
  replace(name: string, body: CRD.Proposal, options?: CreateOptions) {
    this.debug(`[replace] ${name}`, body, options);
    const { dryRun, fieldManager, headers } = options || {};
    return this.k8sApi.replaceClusterCustomObject(
      group,
      version,
      plural,
      name,
      Object.assign({}, DEFAULT_BODY, body),
      dryRun,
      fieldManager,
      { headers },
    ) as Promise<{
      response: http.IncomingMessage;
      body: CRD.Proposal;
    }>;
  }

  /**
   * 部分更新指定的 Proposal (JSON Patch)
   *
   * @param {string} name Proposal 名称
   * @param {JsonPatchOp[]} body Proposal patch json 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patch(name: string, body: JsonPatchOp[], options?: PatchOptions) {
    this.debug(`[patch] ${name}`, body, options);
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchClusterCustomObject(
      group,
      version,
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
      body: CRD.Proposal;
    }>;
  }

  /**
   * 部分更新指定的 Proposal (Merge Patch)
   *
   * @param {string} name Proposal 名称
   * @param {object} body Proposal 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchMerge(name: string, body: object, options?: PatchOptions) {
    this.debug(`[patchMerge] ${name}`, body, options);
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchClusterCustomObject(
      group,
      version,
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
      body: CRD.Proposal;
    }>;
  }

  /**
   * 部分更新指定的 Proposal (Strategic Merge Patch)
   *
   * @param {string} name Proposal 名称
   * @param {object} body Proposal 对象
   * @param {PatchOptions} [options] 可选配置项
   */
  patchStrategicMerge(name: string, body: object, options?: PatchOptions) {
    this.debug(`[patchStrategicMerge] ${name}`, body, options);
    const { dryRun, fieldManager, force, headers } = options || {};
    return this.k8sApi.patchClusterCustomObject(
      group,
      version,
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
      body: CRD.Proposal;
    }>;
  }

  /**
   * 根据名称删除一个  Proposal
   *
   * @param {string} name Proposal 名称
   * @param {DeleteOptions} [options] 可选配置项
   */
  delete(name: string, options?: DeleteOptions) {
    this.debug(`[delete] ${name}`, options);
    const {
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteClusterCustomObject(
      group,
      version,
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
      body: K8s.V1Status;
    }>;
  }

  /**
   * 根据选择器删除多个 Proposal
   *
   * @param {DeleteCollectionOptions} [options] 可选配置项
   */
  deleteCollection(options?: DeleteCollectionOptions) {
    this.debug('[deleteCollection]', options);
    const {
      pretty,
      dryRun,
      gracePeriodSeconds,
      orphanDependents,
      propagationPolicy,
      body,
      headers,
    } = options || {};
    return this.k8sApi.deleteCollectionClusterCustomObject(
      group,
      version,
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
   * 根据名称获取 Proposal 详情
   *
   * @param {string} name Proposal 名称
   * @param {ListOptions} [options] 可选配置项
   */
  read(name: string, options?: ReadOptions) {
    this.debug(`[read] ${name}`, options);
    const { headers } = options || {};
    return this.k8sApi.getClusterCustomObject(group, version, plural, name, {
      headers,
    }) as Promise<{
      response: http.IncomingMessage;
      body: CRD.Proposal;
    }>;
  }

  /**
   * 列取 Proposal 列表
   *
   * @param {ListOptions} [options] 可选配置项
   */
  list(options?: ListOptions) {
    this.debug('[list]', options);
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
    return this.k8sApi.listClusterCustomObject(
      group,
      version,
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
      body: CRD.ProposalList;
    }>;
  }
}
