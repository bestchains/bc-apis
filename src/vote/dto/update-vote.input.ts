import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateVote {
  /** 是否通过 */
  decision: boolean;

  /** 备注 */
  description?: string;
}
