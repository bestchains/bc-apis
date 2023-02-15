import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { AnyObj } from 'src/types';
import { User } from 'src/users/models/user.model';
import { StatusType } from './status-type.enum';

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

  /** Users | ServiceAccounts */
  @HideField()
  clients?: string[];

  /** 状态 */
  @Field(() => StatusType)
  status?: string;

  /** 原因（状态为非Deplyed时） */
  reason?: string;

  /** 加入时间（只在联盟中使用） */
  joinedAt?: string;

  @HideField()
  federations?: AnyObj;
}
