/**
 * 由 src/kubernetes/gen/index.ts 自动生成
 * !!! 请不要修改 !!!
 */
/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Vote represents an organization's position on a proposal, including voting results and optional reasons.
 */
export interface Vote {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion?: string;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind?: string;
  metadata?: {
    [k: string]: any;
  };
  spec?: {
    decision?: boolean;
    description?: string;
    organizationName: string;
    proposalName: string;
    [k: string]: any;
  };
  status?: {
    /**
     * VotePhase is a label for the condition of a vote at the current time.
     */
    phase?: string;
    /**
     * Timestamp of voting.
     */
    startTime?: string;
    [k: string]: any;
  };
  [k: string]: any;
}
