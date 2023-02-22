import { ObjectType, Field, ID, HideField } from '@nestjs/graphql';
import { SpecMember } from 'src/common/models/spec-member.model';
import { Network } from 'src/network/models/network.model';
import { Organization } from 'src/organization/models/organization.model';
import { ProposalPolicy } from 'src/proposal/models/proposal-policy.enum';
import { FederationStatus } from './federation-status.enum';

@ObjectType({ description: '联盟' })
export class Federation {
  @Field(() => ID, { description: 'name' })
  name: string;

  @HideField()
  initiatorName?: string;

  /** 发起者 */
  initiator?: Organization;

  @HideField()
  members?: SpecMember[];

  /** 组织 */
  organizations?: Organization[];

  @HideField()
  networkNames?: string[];

  /** 网络个数 */
  networks?: Network[];

  /** 创建时间 */
  creationTimestamp: string;

  /** 描述 */
  description?: string;

  /** 加入时间（当前用户所属组织加入此联盟的时间） */
  joinedAt?: string;

  /** 提议策略 */
  @Field(() => ProposalPolicy, { description: '提议策略' })
  policy?: string;

  /** 状态 */
  @Field(() => FederationStatus, { description: '状态' })
  status?: string;
}
