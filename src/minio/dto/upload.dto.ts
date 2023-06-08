import { IsEnum } from 'class-validator';

enum BucketName {
  bestchains = 'bestchains',
  depository = 'depository',
}

export class UploadDto {
  @IsEnum(BucketName, { message: `the value of 'bucket' is not supported.` })
  bucket: BucketName;
}
