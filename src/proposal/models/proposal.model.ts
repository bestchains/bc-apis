import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Policy } from './policy.enum';
import { StatusPhase } from './status-phase.enum';

@ObjectType()
export class Proposal {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 创建时间 */
  creationTimestamp: string;

  /** 提议类型 */
  type?: string; // TODO enum

  /** 提议策略 */
  @Field(() => Policy)
  policy?: string;

  /** 截止时间 */
  endAt?: string;

  /** 当前状态 */
  @Field(() => StatusPhase)
  status?: string;

  /** 已投票 */
  // vote.status.phase  TODO
}
