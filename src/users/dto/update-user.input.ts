import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  /** groups */
  groups: string[];
}
