import { registerEnumType } from '@nestjs/graphql';

export enum StatusType {
  Deploying = 'Deploying',
  Deployed = 'Deployed',
  Precreated = 'Precreated',
  Error = 'Error',
  Warning = 'Warning',
  Initializing = 'Initializing',
  Created = 'Created',
}

registerEnumType(StatusType, {
  name: 'StatusType',
  description: '「组织」状态',
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
      description:
        "Error is the status when a component's deployment has failed due to an error",
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
  },
});
