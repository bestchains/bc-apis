import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class NewChaincode {
  /** 合约name */
  name: string;

  /** 合约名称 */
  displayName: string;

  /** 安装节点 */
  @Field(() => String, { description: '安装节点（暂不支持）' })
  ibppeer?: string;

  /** 通道 */
  channel: string;

  /** 背书策略 */
  epolicy: string;
}
