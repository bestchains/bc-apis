import { registerEnumType } from '@nestjs/graphql';

export enum FederationStatus {
  FederationPending = 'FederationPending',
  FederationActivated = 'FederationActivated',
  FederationFailed = 'FederationFailed',
  FederationDissolved = 'FederationDissolved',
  Error = 'Error',
}

registerEnumType(FederationStatus, {
  name: 'FederationStatus',
  description: '「联盟」状态',
  valuesMap: {
    FederationPending: {
      description: '组建中',
    },
    FederationActivated: {
      description: '已激活',
    },
    FederationFailed: {
      description: '组建失败',
    },
    FederationDissolved: {
      description: '已解散',
    },
    Error: {
      description: '失败',
    },
  },
});
