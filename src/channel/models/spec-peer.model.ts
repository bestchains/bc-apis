import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SpecPeer {
  /** 名称 */
  name?: string;

  /** 命名空间（所属组织） */
  namespace?: string;

  [k: string]: any;
}
