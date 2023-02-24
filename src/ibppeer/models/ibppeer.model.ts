import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { SpecResource } from 'src/common/models/spec-resource.model';
import { AnyObj } from 'src/types';
import { IbppeerStatus } from './ibppeer-status.enum';

@ObjectType()
export class Ibppeer {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 创建时间 */
  creationTimestamp: string;

  @HideField()
  namespace?: string;

  /** 加入的网络 */
  networks?: string[];

  /** 加入的通道 */
  channels?: string[];

  /** 节点配置 */
  @Field(() => SpecResource, { description: '节点配置' })
  limits?: AnyObj;

  /** 运行状态 */
  @Field(() => IbppeerStatus, { description: '运行状态' })
  status?: string;
}
