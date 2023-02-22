import { registerEnumType } from '@nestjs/graphql';

export enum ChannelStatus {
  Deploying = 'Deploying',
  Deployed = 'Deployed',
  Error = 'Error',
}

registerEnumType(ChannelStatus, {
  name: 'ChannelStatus',
  description: '「通道」状态',
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
