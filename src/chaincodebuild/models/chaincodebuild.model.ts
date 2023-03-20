import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Channel } from 'src/channel/models/channel.model';
import { SpecPeer } from 'src/channel/models/spec-peer.model';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';
import { Organization } from 'src/organization/models/organization.model';

@ObjectType()
export class Chaincodebuild {
  @Field(() => ID, { description: 'metadata.name' })
  name: string;

  /** 名称 */
  displayName: string;

  /** 状态 */
  @Field(() => CrdStatusType, {
    description: '状态（为Created且pipelineImageUrl有值时，才能部署升级）',
  })
  status?: string;

  /** Pipeline Results */
  pipelineImageUrl?: string;

  /** 版本 */
  version?: string;

  /** 创建时间 */
  creationTimestamp?: string;

  /** 所在网络 */
  network?: string;

  /** 发起者（组织） */
  initiator?: string;

  /** 组织 */
  organizations?: Organization[];

  /** 节点 */
  ibppeers?: SpecPeer[];

  /** 通道 */
  channels?: Channel[];
}
