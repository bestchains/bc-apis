import { InputType } from '@nestjs/graphql';

@InputType()
export class NewProposal {
  /** 联盟名称（federation name） */
  federation: string;

  /** 发起者（当前用户所在的组织） */
  initiator: string;

  /** 组织 */
  organizations?: string[];

  /** 网络 */
  network?: string;

  /** 合约 */
  chaincode?: string;

  chaincodebuild?: string;

  channel?: string;
}
