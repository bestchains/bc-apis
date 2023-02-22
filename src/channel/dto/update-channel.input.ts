import { Field, InputType } from '@nestjs/graphql';
import { ChannelPeer } from './channel-peer.input';
import { Operate } from './operate.enum';

@InputType()
export class UpdateChannel {
  /** 操作的节点 */
  @Field(() => [ChannelPeer], {
    description:
      '被操作的节点，若是添加节点，则Peer节点仅能选Deployed的（通过「getIbppeersForCreateChannel」API获取）',
  })
  peers: ChannelPeer[];

  /** 操作类型 */
  operate: Operate;
}
