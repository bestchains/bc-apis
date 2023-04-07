import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'pod 信息' })
export class Pod {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** namespace */
  namespace: string;

  /** 容器 */
  containers: string[];
}
