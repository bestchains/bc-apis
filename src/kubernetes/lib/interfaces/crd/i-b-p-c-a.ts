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
 * Certificate Authorities issue certificates for all the identities to transact on the network. Warning: CA deployment using this tile is not supported. Please use the IBP Console to deploy a CA.
 */
export interface IBPCA {
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
   * IBPCASpec defines the desired state of IBP CA
   */
  spec?: {
    /**
     * Action (Optional) is action object for trigerring actions
     */
    action?: {
      /**
       * Renew action is object for certificate renewals
       */
      renew?: {
        /**
         * TLSCert action is used to renew TLS crypto for CA server
         */
        tlscert?: boolean;
        [k: string]: any;
      };
      /**
       * Restart action is used to restart the running CA
       */
      restart?: boolean;
      [k: string]: any;
    };
    /**
     * Arch (Optional) is the architecture of the nodes where CA should be deployed
     */
    arch?: string[];
    /**
     * ConfigOverride (Optional) is the object to provide overrides to CA & TLSCA config
     */
    configoverride?: {
      /**
       * CA (Optional) is the overrides to CA's configuration
       */
      ca?: {
        [k: string]: any;
      };
      /**
       * MaxNameLength (Optional) is the maximum length of the name that the CA can have
       */
      maxnamelength?: number;
      /**
       * TLSCA (Optional) is the overrides to TLSCA's configuration
       */
      tlsca?: {
        [k: string]: any;
      };
      [k: string]: any;
    };
    /**
     * CustomNames (Optional) is to use pre-configured resources for CA's deployment
     */
    customNames?: {
      /**
       * PVC is the list of PVC Names to be used for CA's deployment
       */
      pvc?: {
        /**
         * CA is the pvc to be used as CA's storage
         */
        ca?: string;
        [k: string]: any;
      };
      /**
       * Sqlite is the sqlite path to be used for CA's deployment
       */
      sqlitepath?: string;
      [k: string]: any;
    };
    /**
     * Domain is the sub-domain used for CA's deployment
     */
    domain?: string;
    /**
     * HSM (Optional) is DEPRECATED
     */
    hsm?: {
      /**
       * PKCS11Endpoint is DEPRECATED
       */
      pkcs11endpoint?: string;
      [k: string]: any;
    };
    /**
     * ImagePullSecrets (Optional) is the list of ImagePullSecrets to be used for CA's deployment
     */
    imagePullSecrets?: string[];
    /**
     * Images (Optional) lists the images to be used for CA's deployment
     */
    images?: {
      /**
       * CAImage is the name of the CA image
       */
      caImage?: string;
      /**
       * CAInitImage is the name of the Init image
       */
      caInitImage?: string;
      /**
       * CAInitTag is the tag of the Init image
       */
      caInitTag?: string;
      /**
       * CATag is the tag of the CA image
       */
      caTag?: string;
      /**
       * EnrollerImage is the name of the init image for crypto generation
       */
      enrollerImage?: string;
      /**
       * EnrollerTag is the tag of the init image for crypto generation
       */
      enrollerTag?: string;
      /**
       * HSMImage is the name of the HSM image
       */
      hsmImage?: string;
      /**
       * HSMTag is the tag of the HSM image
       */
      hsmTag?: string;
      [k: string]: any;
    };
    /**
     * Ingress (Optional) is ingress object for ingress overrides
     */
    ingress?: {
      /**
       * Class (Optional) is the class to set for ingress
       */
      class?: string;
      /**
       * TlsSecretName (Optional) is the secret name to be used for tls certificates
       */
      tlsSecretName?: string;
      [k: string]: any;
    };
    /**
     * License should be accepted by the user to be able to setup CA
     */
    license: {
      /**
       * Accept should be set to true to accept the license.
       */
      accept?: true;
      [k: string]: any;
    };
    /**
     * NumSecondsWarningPeriod (Optional - default 30 days) is used to define certificate expiry warning period.
     */
    numSecondsWarningPeriod?: number;
    /**
     * Region (Optional) is the region of the nodes where the CA should be deployed
     */
    region?: string;
    /**
     * RegistryURL is registry url used to pull images
     */
    registryURL?: string;
    /**
     * Replicas (Optional - default 1) is the number of CA replicas to be setup
     */
    replicas?: number;
    /**
     * Resources (Optional) is the amount of resources to be provided to CA deployment
     */
    resources?: {
      /**
       * CA is the resources provided to the CA container
       */
      ca?: {
        /**
         * Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        limits?: {
          [k: string]: number | string;
        };
        /**
         * Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        requests?: {
          [k: string]: number | string;
        };
        [k: string]: any;
      };
      /**
       * EnrollJJob is the resources provided to the enroll job container
       */
      enrollJob?: {
        /**
         * Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        limits?: {
          [k: string]: number | string;
        };
        /**
         * Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        requests?: {
          [k: string]: number | string;
        };
        [k: string]: any;
      };
      /**
       * HSMDaemon is the resources provided to the HSM daemon container
       */
      hsmDaemon?: {
        /**
         * Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        limits?: {
          [k: string]: number | string;
        };
        /**
         * Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        requests?: {
          [k: string]: number | string;
        };
        [k: string]: any;
      };
      /**
       * Init is the resources provided to the init container
       */
      init?: {
        /**
         * Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        limits?: {
          [k: string]: number | string;
        };
        /**
         * Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
         */
        requests?: {
          [k: string]: number | string;
        };
        [k: string]: any;
      };
      [k: string]: any;
    };
    /**
     * Service (Optional) is the override object for CA's service
     */
    service?: {
      /**
       * The "type" of the service to be used
       */
      type?: string;
      [k: string]: any;
    };
    /**
     * Storage (Optional - uses default storageclass if not provided) is the override object for CA's PVC config
     */
    storage?: {
      /**
       * CA is the configuration of the storage of the CA
       */
      ca?: {
        /**
         * Class is the storage class
         */
        class?: string;
        /**
         * Size of storage
         */
        size?: string;
        [k: string]: any;
      };
      [k: string]: any;
    };
    /**
     * FabricVersion (Optional) set the fabric version you want to use.
     */
    version: string;
    /**
     * Zone (Optional) is the zone of the nodes where the CA should be deployed
     */
    zone?: string;
    [k: string]: any;
  };
  /**
   * Status is the observed state of IBPCA
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
