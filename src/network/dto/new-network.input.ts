import { Field, InputType } from '@nestjs/graphql';
import { Length } from 'class-validator';
import { OrderVersion } from './order-version.enum';

@InputType()
export class NewNetworkInput {
  /** 网络名称（name） */
  @Field(() => String, {
    description:
      '网络名称，规则：小写字母、数字、“-”，开头和结尾只能是字母或数字（[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*）',
  })
  @Length(3, 63)
  name: string;

  /** 所属联盟 */
  federation: string;

  /** 发起者（当前用户所在的组织） */
  initiator: string;

  /** 共识集群节点数（要求单数，默认1） */
  clusterSize: number;

  /** 共识算法 */
  ordererType?: string;

  /** 选择版本 */
  @Field(() => OrderVersion, { description: '选择版本' })
  version?: string;

  /** 描述 */
  description?: string;
}
