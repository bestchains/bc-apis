import { registerEnumType } from '@nestjs/graphql';

export enum VotePhase {
  Created = 'Created',
  Voted = 'Voted',
  Finished = 'Finished',
  NotVoted = 'NotVoted',
}

registerEnumType(VotePhase, {
  name: 'VotePhase',
  description: '「Vote」状态',
  valuesMap: {
    Created: {
      description:
        'The organization administrator has not yet participated in the voting.',
    },
    Voted: {
      description: 'The organization administrator has vote for the proposal.',
    },
    Finished: {
      description: 'The proposal has been finished.',
    },
    NotVoted: {
      description: '未投票',
    },
  },
});
