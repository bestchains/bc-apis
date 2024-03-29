import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Chaincode } from 'src/chaincode/models/chaincode.model';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';
import { SpecMember } from 'src/common/models/spec-member.model';
import { Epolicy } from 'src/epolicy/models/epolicy.model';
import { Organization } from 'src/organization/models/organization.model';
import { SpecPeer } from './spec-peer.model';

@ObjectType()
export class Channel {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 名称 */
  displayName?: string;

  /** 描述 */
  description?: string;

  /** 组织数量 */
  members?: SpecMember[];

  /** 用户作为admin管理的组织 */
  adminOrganizations?: Organization[];

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

  /** 网络 */
  network?: string;

  /** 通道连接文件（profile.json）*/
  @Field(() => String, {
    description: '通道连接文件（profile.json）',
    deprecationReason: '替代为query channelProfile()',
  })
  profileJson?: string;
}
