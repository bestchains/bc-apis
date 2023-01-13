import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateOrganization {
  /** 组织成员 */
  users?: string[];

  /** 管理员 */
  admin?: string;
}
