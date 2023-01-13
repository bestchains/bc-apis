import { Field, InputType } from '@nestjs/graphql';
import { OrderVersion } from './order-version.enum';

@InputType()
export class NewNetworkInput {
  /** 所属联盟 */
  federation: string;

  /** 选择组织 */
  @Field(() => [String], {
    description: '选择组织',
  })
  organizations: string[];

  /** 发起者（当前用户所在的组织） */
  initiator: string;

  /** 共识集群节点数（要求单数，默认1） */
  clusterSize: number;

  /** 共识算法 */
  ordererType?: string;

  /** 选择版本 */
  @Field(() => OrderVersion, { description: '选择版本' })
  version?: string;
}
