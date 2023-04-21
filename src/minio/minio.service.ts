import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import minioConfig from 'src/config/minio.config';
import * as Minio from 'minio';
import {
  UploadedObjectInfo,
  BucketItemFromList,
  BucketStream,
  BucketItem,
} from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor(
    @Inject(minioConfig.KEY)
    private readonly config: ConfigType<typeof minioConfig>,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.config.endPoint,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
      port: 9000,
      useSSL: false,
    });
  }

  async bucketExists(bucket: string): Promise<boolean> {
    return this.minioClient.bucketExists(bucket);
  }

  async makeBucket(name: string): Promise<void> {
    return this.minioClient.makeBucket(name);
  }

  async listBuckets(): Promise<BucketItemFromList[]> {
    return this.minioClient.listBuckets();
  }

  listObjects(bucket: string, prefix?: string): BucketStream<BucketItem> {
    return this.minioClient.listObjects(bucket, prefix, true);
  }

  async getObject(bucket: string, name: string): Promise<Readable> {
    return this.minioClient.getObject(bucket, name);
  }

  async putObject(
    bucket: string,
    name: string,
    stream: Readable | Buffer | string,
  ): Promise<UploadedObjectInfo> {
    return this.minioClient.putObject(bucket, name, stream);
  }

  async fgetObject(
    bucket: string,
    name: string,
    filePath: string,
  ): Promise<void> {
    return this.minioClient.fGetObject(bucket, name, filePath);
  }

  async fputObject(
    bucket: string,
    name: string,
    filePath: string,
  ): Promise<UploadedObjectInfo> {
    return this.minioClient.fPutObject(bucket, name, filePath);
  }

  async copyObject(
    bucket: string,
    name: string,
    targetPath: string,
  ): Promise<Minio.BucketItemCopy> {
    const conds = new Minio.CopyConditions();
    return this.minioClient.copyObject(bucket, name, targetPath, conds);
  }
}
