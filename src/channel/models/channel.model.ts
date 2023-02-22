import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SpecMember } from 'src/common/models/spec-member.model';
import { ChannelStatus } from './channel-status.enum';
import { SpecPeer } from './spec-peer.model';

@ObjectType()
export class Channel {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 组织数量 */
  members?: SpecMember[];

  /** 我的节点 */
  peers?: SpecPeer[];

  /** 合约数量 */
  // TODO

  /** 创建时间 */
  creationTimestamp?: string;

  /** 状态 */
  @Field(() => ChannelStatus, { description: '状态' })
  status?: string;
}
