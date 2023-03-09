import { registerEnumType } from '@nestjs/graphql';

export enum ChaincodePhase {
  ChaincodeUnapproved = 'ChaincodeUnapproved',
  ChaincodePending = 'ChaincodePending',
  ChaincodeApproved = 'ChaincodeApproved',
  ChaincodeRunning = 'ChaincodeRunning',
}

registerEnumType(ChaincodePhase, {
  name: 'ChaincodePhase',
  description: '「通道」状态',
  valuesMap: {
    ChaincodeUnapproved: {
      description: 'ChaincodeUnapproved',
    },
    ChaincodePending: {
      description: 'ChaincodePending',
    },
    ChaincodeApproved: {
      description: 'ChaincodeApproved',
    },
    ChaincodeRunning: {
      description: 'ChaincodeRunning',
    },
  },
});
