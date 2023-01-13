import { registerEnumType } from '@nestjs/graphql';

export enum ProposalPolicy {
  OneVoteVeto = 'OneVoteVeto',
  Majority = 'Majority',
  All = 'All',
}

registerEnumType(ProposalPolicy, {
  name: 'ProposalPolicy',
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
