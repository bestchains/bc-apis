import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AnyObj } from 'src/types';

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

  /** 接口 */
  @Field(() => [ContractInterface], { description: '接口' })
  interfaces?: AnyObj;
}

@ObjectType()
class ContractInterface {
  /** 名称 */
  name: string;

  /** 参数 */
  args: string[];

  /** 简介 */
  description: string;

  /** 条件 */
  condition: string;
}
