import { registerEnumType } from '@nestjs/graphql';

export enum Operate {
  add = 'add',
  remove = 'remove',
}

registerEnumType(Operate, {
  name: 'Operator',
  description: '操作',
  valuesMap: {
    add: {
      description: '加入节点',
    },
    remove: {
      description: '移除节点',
    },
  },
});
