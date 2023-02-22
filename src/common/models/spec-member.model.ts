import { ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '成员个数' })
export class SpecMember {
  /** 是否为发起者 */
  initiator?: boolean;

  /** 组织名称 */
  name?: string;

  namespace?: string;

  /** 加入时间 */
  joinedAt?: string;

  joinedBy?: string;

  [k: string]: any;
}
