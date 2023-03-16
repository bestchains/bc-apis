import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { Chaincode } from 'src/chaincode/models/chaincode.model';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';
import { SpecMember } from 'src/common/models/spec-member.model';
import { Epolicy } from 'src/epolicy/models/epolicy.model';
import { SpecPeer } from './spec-peer.model';

@ObjectType()
export class Channel {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 描述 */
  description?: string;

  /** 组织数量 */
  members?: SpecMember[];

  /** 我的节点 */
  peers?: SpecPeer[];

  /** 合约 */
  chaincode?: Chaincode[];

  /** 创建时间 */
  creationTimestamp?: string;

  /** 状态 */
  @Field(() => CrdStatusType, { description: '状态' })
  status?: string;

  /** 我创建的 */
  createdByMe?: boolean;

  /** 我参与的 */
  iamInvolved?: boolean;

  /** 背书策略 */
  epolicy?: Epolicy[];

  @HideField()
  network?: string;
}
