import { InputType } from '@nestjs/graphql';

@InputType()
export class ChannelPeer {
  /** 名称 */
  name: string;

  /** 命名空间（所属组织） */
  namespace: string;
}
