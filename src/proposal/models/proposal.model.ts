import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { ProposalPolicy } from './proposal-policy.enum';
import { ProposalType } from './proposal-type.enum';
import { Vote } from 'src/vote/models/vote.model';
import { VotePhase } from 'src/vote/models/vote-phase.enum';
import { Organization } from 'src/organization/models/organization.model';
import { ProposalStatus } from './proposal-status.enum';

@ObjectType()
export class Proposal {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 创建时间 */
  creationTimestamp: string;

  /** 提议类型 */
  @Field(() => ProposalType, { description: '提议类型' })
  type?: string;

  /** 提议策略 */
  @Field(() => ProposalPolicy, { description: '提议策略' })
  policy?: string;

  /** 截止时间 */
  endAt?: string;

  @HideField()
  statusPhase?: string;

  @HideField()
  statusConfitionType?: string;

  /** 当前状态 */
  @Field(() => ProposalStatus)
  status?: string;

  /** 提议内的所有投票 */
  votes?: Vote[];

  /** 当前用户所在组织的投票状态 */
  voted?: VotePhase;

  @HideField()
  initiatorName?: string;

  /** 发起者 */
  initiator?: Organization;
}
