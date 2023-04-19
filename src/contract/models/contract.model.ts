import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '智能合约' })
export class Contract {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 版本 */
  version: string;

  /** 来源 */
  from: string;

  /** 描述 */
  description: string;

  /** 项目 */
  package: string;

  /** 状态 */
  status: string;
}
