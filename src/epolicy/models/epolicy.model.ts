import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '背书策略' })
export class Epolicy {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 策略名称 */
  displayName?: string;

  /** 所在通道 */
  channel: string;

  /** 描述 */
  description?: string;

  /** 策略内容 */
  value: string;

  /** 创建时间 */
  creationTimestamp?: string;

  /** 更新时间 */
  lastHeartbeatTime?: string;
}
