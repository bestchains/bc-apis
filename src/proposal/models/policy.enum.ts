import { registerEnumType } from '@nestjs/graphql';

export enum Policy {
  OneVoteVeto = 'OneVoteVeto',
  Majority = 'Majority',
  All = 'All',
}

registerEnumType(Policy, {
  name: 'Policy',
  description: '提议策略',
  valuesMap: {
    OneVoteVeto: {
      description: '', // TODO
    },
    Majority: {
      description: '',
    },
    All: {
      description: '',
    },
  },
});
