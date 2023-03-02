import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { AnyObj } from 'src/types';

@ObjectType({ description: '用户' })
export class User {
  @Field(() => ID, { description: '用户名' })
  name: string;

  /** 密码 */
  password?: string;

  /** 手机 */
  phone: string;

  /** 邮箱 */
  email: string;

  /** 备注 */
  description?: string;

  /** 创建时间 */
  creationTimestamp: string;

  @HideField()
  groups: string[];

  /** 是否为组织管理员（组织列表中） */
  isOrganizationAdmin?: boolean;

  /** 加入组织时间（组织列表中） */
  joinedAt?: string;

  @HideField()
  annotations?: AnyObj;
}
