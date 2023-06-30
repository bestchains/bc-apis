import {
  Controller,
  Get,
  Post,
  InternalServerErrorException,
  Logger,
  Query,
  Res,
  StreamableFile,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { MinioService } from './minio.service';
import * as archiver from 'archiver';
import { Response } from 'src/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { genContentHash, DEPOSITORY_BUCKET_NAME } from 'src/common/utils';
import { UploadDto } from './dto/upload.dto';

@Controller('minio')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  logger = new Logger('MinioController');

  @Get('/download')
  async download(
    @Query('bucket') bucket: string,
    @Query('object') object: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const isFile = /^.+\.\w+$/.test(object);
    if (isFile) {
      const stream = await this.minioService.getObject(bucket, object);
      response.setHeader('Content-Type', 'application/octet-stream');
      response.setHeader(
        'Content-Disposition',
        `attachment;filename="${object}"`,
      );
      return new StreamableFile(stream);
    }
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });
    const stream = this.minioService.listObjects(bucket, `${object}/`);
    const objs = [];
    stream.on('data', (obj) => {
      objs.push(obj);
    });
    stream.on('end', async () => {
      for (const obj of objs) {
        const n = obj.name;
        const file = await this.minioService.getObject(bucket, n);
        archive.append(file, { name: n });
      }
      archive.finalize();
    });
    stream.on('error', (err) => {
      this.logger.error('minio error: ', err);
      throw new InternalServerErrorException(
        'Failed to list files from minIO.',
      );
    });
    archive.on('error', (err) => {
      this.logger.error('zip error: ', err);
      throw new InternalServerErrorException('Failed to compress file.');
    });
    archive.on('warning', (err) => {
      this.logger.warn('zip warning: ', err);
    });
    response.setHeader('Content-Type', 'application/zip');
    response.setHeader(
      'Content-Disposition',
      `attachment;filename="${object}.zip"`,
    );
    return new StreamableFile(archive);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10000000 } }))
  async upload(
    @Body() body: UploadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { bucket = DEPOSITORY_BUCKET_NAME } = body;
    const exist = await this.minioService.bucketExists(bucket);
    if (!exist) {
      await this.minioService.makeBucket(bucket);
    }

    const { originalname, buffer } = file;
    const lastN = originalname.lastIndexOf('.');
    const suffix = lastN > 0 ? originalname.substring(lastN) : '';
    // bucket depository 存证文件不需要后缀，不提供下载功能
    const hashFilename = `${genContentHash(buffer)}${
      bucket === DEPOSITORY_BUCKET_NAME ? '' : suffix
    }`;

    await this.minioService.putObject(bucket, hashFilename, buffer);
    return {
      id: hashFilename,
    };
  }
}
