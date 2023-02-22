import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AnyObj } from 'src/types';
import { IbppeerStatus } from './ibppeer-status.enum';

@ObjectType()
export class Ibppeer {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 创建时间 */
  creationTimestamp: string;

  /** 加入的网络 */
  // TODO

  /** 加入的通道 */
  // TODO
  // org -> fed -> net -> chan  -> peers

  /** 节点配置 */
  @Field(() => SpecResource, { description: '节点配置' })
  limits?: AnyObj;

  /** 运行状态 */
  @Field(() => IbppeerStatus, { description: '运行状态' })
  status?: string;
}

@ObjectType()
class SpecResource {
  /** CPU */
  cpu: string;

  /** Memory */
  memory: string;
}
