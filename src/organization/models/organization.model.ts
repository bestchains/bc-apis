import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';
import { Ibppeer } from 'src/ibppeer/models/ibppeer.model';
import { Network } from 'src/network/models/network.model';
import { User } from 'src/users/models/user.model';

@ObjectType({ description: '组织' })
export class Organization {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 名称 */
  displayName?: string;

  /** 描述 */
  description?: string;

  /** 创建时间 */
  creationTimestamp: string;

  /** 更新时间 */
  lastHeartbeatTime?: string;

  /** 管理员 */
  admin?: string;

  /** 成员 */
  users?: User[];

  /** 我是否参与（作为组织的Admin或Client） */
  iAmIn?: boolean;

  /** Users | ServiceAccounts */
  @HideField()
  clients?: string[];

  /** 状态 */
  @Field(() => CrdStatusType)
  status?: string;

  /** 原因 */
  reason?: string;

  /** 加入时间（只在联盟中使用） */
  joinedAt?: string;

  /** 所在联盟 */
  federations?: string[];

  /** 所在网络 */
  networks?: Network[];

  /** 所有节点 */
  ibppeers?: Ibppeer[];

  /** 加入的通道 */
  channels?: string[];
}
