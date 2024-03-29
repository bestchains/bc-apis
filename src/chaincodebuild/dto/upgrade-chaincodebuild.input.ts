import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'src/types';

@InputType()
export class UpgradeChaincodebuild {
  /** 合约名称 */
  displayName: string;

  /** 升级后版本号 */
  newVersion: string;

  /** 此合约构建所在网络 */
  network: string;

  /** 合约文件 */
  @Field(() => GraphQLUpload)
  file?: Promise<FileUpload>;

  /** 合约文件夹 */
  @Field(() => [GraphQLUpload])
  files?: Promise<FileUpload[]>;

  /** 文件夹内文件的相对路径 */
  fileRelativePaths?: string[];

  /** 选择语言 */
  language?: string;
}
