import { registerEnumType } from '@nestjs/graphql';

export enum StatusPhase {
  Pending = 'Pending',
  Voting = 'Voting',
  Finished = 'Finished',
}

registerEnumType(StatusPhase, {
  name: 'StatusPhase',
  description: '「提议」状态',
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
