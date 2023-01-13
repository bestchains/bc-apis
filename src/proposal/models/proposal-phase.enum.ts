import { registerEnumType } from '@nestjs/graphql';

export enum ProposalPhase {
  Pending = 'Pending',
  Voting = 'Voting',
  Finished = 'Finished',
}

registerEnumType(ProposalPhase, {
  name: 'ProposalPhase',
  description: '「提议」Phase',
  valuesMap: {
    Pending: {
      description:
        'the pod has been accepted by the system, but not all vote has been created',
    },
    Voting: {
      description: 'all votes has been created, waiting vote by administrator',
    },
    Finished: {
      description: 'proposal has been finished',
    },
  },
});
