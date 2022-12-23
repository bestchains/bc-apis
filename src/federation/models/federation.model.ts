import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: '联盟' })
export class Federation {
  @Field(() => ID, { description: '联盟 name' })
  name: string;
}
