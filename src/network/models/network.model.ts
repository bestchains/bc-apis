import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { Channel } from 'src/channel/models/channel.model';
import { CrdStatusType } from 'src/common/models/crd-statue-type.enum';
import { SpecResource } from 'src/common/models/spec-resource.model';
import { Ibppeer } from 'src/ibppeer/models/ibppeer.model';
import { Organization } from 'src/organization/models/organization.model';
import { AnyObj } from 'src/types';
import { OrderVersion } from '../dto/order-version.enum';

@ObjectType({ description: '网络' })
export class Network {
  @Field(() => ID, { description: 'name' })
  name: string;

  /** 所属联盟 */
  federation?: string;

  /** 创建时间 */
  creationTimestamp?: string;

  /** 更新时间 */
  lastHeartbeatTime?: string;

  /** 到期时间 */
  expiredTime?: string;

  /** 状态 */
  @Field(() => CrdStatusType, {
    description: '状态（网络运行中：Deployed，网络停止：NetworkDissolved）',
  })
  status?: string;

  /** 引擎类型 */
  ordererType?: string;

  /** 我的节点数 */
  clusterSize?: number;

  @HideField()
  members?: Member[];

  /** 组织 */
  @Field(() => [Organization], { description: '网络中组织' })
  organizations?: Organization[];

  @HideField()
  initiatorName?: string;

  /** 发起者 */
  @Field(() => Organization, { description: '网络发起者（组织）' })
  initiator?: Organization;

  @HideField()
  channelNames?: string[];

  /** 通道列表 */
  channels?: Channel[];

  /** 描述 */
  description?: string;

  /** 节点配置 */
  @Field(() => SpecResource, { description: '节点配置' })
  limits?: AnyObj;

  /** 节点存储 */
  storage?: string;

  /** 节点版本 */
  @Field(() => OrderVersion, { description: '节点版本' })
  version?: string;

  /** 网络中的所有节点 */
  peers?: Ibppeer[];
}

@ObjectType({ description: '成员' })
class Member {
  /** 是否为发起者 */
  initiator?: boolean;

  /** name */
  name?: string;

  [k: string]: any;
}
