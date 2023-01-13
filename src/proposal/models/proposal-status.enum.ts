import { registerEnumType } from '@nestjs/graphql';

export enum ProposalStatus {
  Pending = 'Pending',
  Voting = 'Voting',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Expired = 'Expired',
  Error = 'Error',
}

registerEnumType(ProposalStatus, {
  name: 'ProposalStatus',
  description: '「提议」状态',
  valuesMap: {
    Pending: {
      description: '等待中',
    },
    Voting: {
      description: '投票中',
    },
    Succeeded: {
      description: '提议成功',
    },
    Failed: {
      description: '提议异常',
    },
    Expired: {
      description: '提议超时',
    },
    Error: {
      description: '提议异常',
    },
  },
});
