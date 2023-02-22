import { registerEnumType } from '@nestjs/graphql';

export enum IbppeerStatus {
  Deploying = 'Deploying',
  Deployed = 'Deployed',
  Error = 'Error',
}

registerEnumType(IbppeerStatus, {
  name: 'IbppeerStatus',
  description: '「Peer节点」状态',
  valuesMap: {
    Deploying: {
      description: 'Deploying',
    },
    Deployed: {
      description: 'Deployed',
    },
    Error: {
      description: '失败',
    },
  },
});
