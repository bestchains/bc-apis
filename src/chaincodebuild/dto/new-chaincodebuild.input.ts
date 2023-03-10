import { Field, InputType } from '@nestjs/graphql';
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { FileUpload } from 'src/types';

@InputType()
export class NewChaincodebuild {
  /** 合约名称 */
  @Field(() => String, {
    description: '合约名称（规则：^[a-z][a-z0-9]{7,63}$）',
  })
  displayName: string;

  /** 此合约构建所在网络 */
  network: string;

  /** 合约版本号 */
  version: string;

  /** 合约文件 */
  @Field(() => GraphQLUpload)
  file?: Promise<FileUpload>;

  /** 合约文件夹 */
  @Field(() => [GraphQLUpload])
  files?: Promise<FileUpload[]>;

  /** 选择语言 */
  language?: string;

  /** 描述 */
  description?: string;
}
