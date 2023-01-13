import { registerEnumType } from '@nestjs/graphql';

export enum ConditionType {
  Initialized = 'Initialized',
  Deployed = 'Deployed',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Expired = 'Expired',
  Error = 'Error',
}

registerEnumType(ConditionType, {
  name: 'ConditionType',
  description: '「提议」Condition',
  valuesMap: {
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
