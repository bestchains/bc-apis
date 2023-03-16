import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class NewEpolicyInput {
  /** 策略名称 */
  @Field(() => String, {
    description: '策略名称',
  })
  displayName: string;

  /** 策略描述 */
  description?: string;

  /** 通道 */
  @Field(() => String, {
    description:
      '通道（当前用户组织参与的channel，使用接口：getChannelsForCreateEpolicy）',
  })
  channel?: string;

  /** 策略内容 */
  @Field(() => String, {
    description:
      '策略内容：可选组织为已选通道内的成员，语法参考（https://hyperledger-fabric.readthedocs.io/en/latest/endorsement-policies.html#endorsement-policy-syntax）',
  })
  value?: string;
}
