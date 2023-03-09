import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ChaincodePhase } from './chaincode-phase.enum';

@ObjectType()
export class Chaincode {
  @Field(() => ID, { description: 'name' })
  name: string;

  @Field(() => ChaincodePhase, { description: '状态' })
  phase?: string;
}
