import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SpecResource {
  /** CPU */
  cpu: string;

  /** Memory */
  memory: string;
}
