import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';

@ObjectType()
export class Chaincodebuild {
  @Field(() => ID, { description: 'metadata.name' })
  name: string;

  /** 名称 */
  displayName: string;

  /** 状态 */
  @Field(() => CrdStatusType, {
    description: '状态（Created时，才能部署升级）',
  })
  status?: string;

  /** 版本 */
  version?: string;

  /** 创建时间 */
  creationTimestamp?: string;
}
