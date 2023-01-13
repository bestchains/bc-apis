import { registerEnumType } from '@nestjs/graphql';

export enum StatusType {
  Deploying = 'Deploying',
  Deployed = 'Deployed',
  Precreated = 'Precreated',
  Error = 'Error',
  Warning = 'Warning',
  Initializing = 'Initializing',
  Created = 'Created',
  FederationPending = 'FederationPending',
  FederationActivated = 'FederationActivated',
  FederationFailed = 'FederationFailed',
  FederationDissolved = 'FederationDissolved',
  NetworkCreated = 'NetworkCreated',
  NetworkDissolved = 'NetworkDissolved',
}

registerEnumType(StatusType, {
  name: 'StatusType',
  description: 'IBPCR 状态',
  valuesMap: {
    Deploying: {
      description: 'Deploying is the status when component is being deployed',
    },
    Deployed: {
      description:
        "Deployed is the status when the component's deployment is done successfully",
    },
    Precreated: {
      description:
        'Precreated is the status of the orderers when they are waiting for config block',
    },
    Error: {
      description: '异常',
    },
    Warning: {
      description:
        'Warning is the status when a component is running, but will fail in future',
    },
    Initializing: {
      description:
        'Initializing is the status when a component is initializing',
    },
    Created: {
      description:
        'Created is the status when component is created successfully',
    },
    FederationPending: {
      description: 'FederationPending means `Proposal-Vote` not passed yet',
    },
    FederationActivated: {
      description: 'FederationActivated means `Proposal-Vote` passed',
    },
    FederationFailed: {
      description: 'FederationFailed means `Proposal-Vote` failed',
    },
    FederationDissolved: {
      description: 'FederationDissolved means `Federation` no longer active',
    },
    NetworkCreated: {
      description: '运行中',
    },
    NetworkDissolved: {
      description: '已解散',
    },
  },
});
