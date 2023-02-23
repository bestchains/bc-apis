import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, Length } from 'class-validator';

@InputType()
export class NewOrganizationInput {
  /** 组织名称（metadata.name） */
  @Field(() => String, {
    description:
      '组织名称，规则：小写字母、数字、“-”，开头和结尾只能是字母或数字（[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*）',
  })
  @Length(3, 63)
  name: string;

  /** 展示名 */
  @IsOptional()
  displayName?: string;

  /** 描述 */
  @IsOptional()
  description?: string;
}
