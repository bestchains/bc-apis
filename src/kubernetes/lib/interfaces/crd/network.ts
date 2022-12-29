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
 * Network is the Schema for the networks API
 */
export interface Network {
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
  /**
   * NetworkSpec defines the desired state of Network
   */
  spec?: {
    /**
     * Consensus cluster(IBPOrderer) which this network utilizes
     */
    consensus?: {
      name?: string;
      namespace?: string;
      [k: string]: any;
    };
    /**
     * Federation which this network belongs to
     */
    federation?: string;
    /**
     * License should be accepted by the user to be able to setup console
     */
    license: {
      /**
       * Accept should be set to true to accept the license.
       */
      accept?: true;
      [k: string]: any;
    };
    /**
     * Members which this network contains (DO NOT EDIT)Cloned automatically from Fderation.Spec.Members
     */
    members?: {
      initiator?: boolean;
      name?: string;
      namespace?: string;
      [k: string]: any;
    }[];
    [k: string]: any;
  };
  /**
   * NetworkStatus defines the observed state of Network
   */
  status?: {
    /**
     * ErrorCode is the code of classification of errors
     */
    errorcode?: number;
    /**
     * LastHeartbeatTime is when the controller reconciled this component
     */
    lastHeartbeatTime?: string;
    /**
     * Message provides a message for the status to be shown to customer
     */
    message?: string;
    /**
     * Reason provides a reason for an error
     */
    reason?: string;
    /**
     * Status is defined based on the current status of the component
     */
    status?: string;
    /**
     * Type is true or false based on if status is valid
     */
    type?: string;
    /**
     * Version is the product (IBP) version of the component
     */
    version?: string;
    /**
     * Versions is the operand version of the component
     */
    versions?: {
      /**
       * Reconciled provides the reconciled version of the operand
       */
      reconciled: string;
      [k: string]: any;
    };
    [k: string]: any;
  };
  [k: string]: any;
}
