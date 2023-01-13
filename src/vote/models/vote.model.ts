import { Field, ID, ObjectType } from '@nestjs/graphql';
import { VotePhase } from './vote-phase.enum';

@ObjectType()
export class Vote {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 所属组织名称 */
  organizationName?: string;

  /** 投票人 */
  organizationAdmin?: string;

  /** 所属提议名称 */
  proposalName?: string;

  /** 投票时间 */
  voteTime?: string;

  /** 表决 */
  decision?: boolean;

  /** 备注 */
  description?: string;

  /** 状态 */
  @Field(() => VotePhase, { description: '状态' })
  status?: string;
}
