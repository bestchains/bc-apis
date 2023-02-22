import { Field, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';
import { ProposalPolicy } from 'src/proposal/models/proposal-policy.enum';

@InputType()
export class NewFederationInput {
  /** 联盟名称（metadata.name） */
  @Field(() => String, {
    description:
      '联盟名称，规则：小写字母、数字、“-”，开头和结尾只能是字母或数字（[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*）',
  })
  @Length(3, 63)
  name: string;

  /** 选择组织 */
  @Field(() => [String], {
    description: '选择组织',
  })
  organizations?: string[];

  /** 发起者（当前用户所在的组织） */
  initiator: string;

  /** 提议投票策略 */
  @Field(() => ProposalPolicy, { description: '提议投票策略' })
  policy: string;

  /** 联盟描述 */
  description?: string;
}
