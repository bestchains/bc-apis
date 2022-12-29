import { Field, ID, ObjectType } from '@nestjs/graphql';
import { StatusType } from './status-type.enum';

@ObjectType({ description: '组织' })
export class Organization {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 名称 */
  displayName?: string;

  /** 创建时间 */
  creationTimestamp: string;

  /** 管理员 */
  admin?: string;

  /** 状态 */
  @Field(() => StatusType)
  status?: string;
}
