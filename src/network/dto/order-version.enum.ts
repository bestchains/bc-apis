import { registerEnumType } from '@nestjs/graphql';

export enum OrderVersion {
  Standard = 'Standard',
  Enterprise = 'Enterprise',
  Finance = 'Finance',
}

registerEnumType(OrderVersion, {
  name: 'OrderVersion',
  description: '新建网络的版本',
  valuesMap: {
    Standard: {
      description: '标准版',
    },
    Enterprise: {
      description: '企业版',
    },
    Finance: {
      description: '金融安全版',
    },
  },
});
