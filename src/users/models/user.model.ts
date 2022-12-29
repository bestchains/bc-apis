import { Field, ID, ObjectType } from '@nestjs/graphql';

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

  /** 时间 (仅作为 Date 类型数据占位用，否则会有 Error: "Date" defined in resolvers, but not in schema 的报错) */
  _date?: Date;

  groups: string[];
}
