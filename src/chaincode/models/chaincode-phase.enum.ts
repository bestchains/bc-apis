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
      description: '投票不通过',
    },
    ChaincodePending: {
      description: '等待投票',
    },
    ChaincodeApproved: {
      description: '投票通过',
    },
    ChaincodeRunning: {
      description: '已经安装，Pod正常运行',
    },
  },
});
