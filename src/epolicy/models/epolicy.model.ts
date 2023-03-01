import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Epolicy {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 所在通道 */
  channel: string;

  /** 描述 */
  description?: string;

  /** 策略内容 */
  value: string;
}
