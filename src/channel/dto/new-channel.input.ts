import { Field, InputType } from '@nestjs/graphql';
import { ChannelPeer } from './channel-peer.input';

@InputType()
export class NewChannel {
  /** 通道名称（channel name） */
  name: string;

  /** 发起者（组织） */
  initiator: string;

  /** 配置成员（组织） */
  organizations?: string[];

  /** 准入门槛 */
  policy?: string;

  /** 描述 */
  description?: string;

  /** peer节点 */
  @Field(() => [ChannelPeer], {
    description:
      'Peer节点，仅能选Deployed的（通过「getIbppeersForCreateChannel」API获取）',
  })
  peers: ChannelPeer[];
}
