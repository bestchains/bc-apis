import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  BESTCHAINS_CONTRACTS_BUCKET,
  BESTCHAINS_CONTRACTS_GIT,
  CustomException,
  MINIO_BUCKET_NAME,
} from 'src/common/utils';
import { RequestOptions } from 'urllib';
import * as urllib from 'urllib';
import * as fs from 'node:fs';
import { Contract } from './models/contract.model';
import { MinioService } from 'src/minio/minio.service';
import { Lang } from './models/Lang.enum';
import { JwtAuth } from 'src/types';
import { ChaincodebuildService } from 'src/chaincodebuild/chaincodebuild.service';
import imageConfig from 'src/config/image.config';

@Injectable()
export class ContractService {
  constructor(
    private readonly minioService: MinioService,
    private readonly ccbService: ChaincodebuildService,
    @Inject(imageConfig.KEY)
    private imgConfig: ConfigType<typeof imageConfig>,
  ) {}

  logger = new Logger('ContractService');

  readContentFromMinIO(lang = Lang.zh): Promise<string> {
    const objectName = `bestchains-contracts/${
      lang === Lang.zh ? 'contracts_zh_Hans.json' : 'contracts.json'
    }`;
    return new Promise(async (resolve, reject) => {
      try {
        const dataStream = await this.minioService.getObject(
          BESTCHAINS_CONTRACTS_BUCKET,
          objectName,
        );
        const chunks = [];
        let size = 0;
        dataStream.on('data', (chunk) => {
          chunks.push(chunk);
          size += chunk.length;
        });
        dataStream.on('end', () => {
          const bufs = Buffer.concat(chunks, size);
          resolve(bufs.toString());
        });
        dataStream.on('error', (e) => {
          this.logger.error(e.stack);
          reject(e);
        });
      } catch (error) {
        this.logger.error(error);
        reject(error);
      }
    });
  }

  async readContentFromGit(lang = Lang.zh): Promise<string> {
    const url = `${BESTCHAINS_CONTRACTS_GIT}${
      lang === Lang.zh ? 'contracts_zh_Hans.json' : 'contracts.json'
    }`;
    Logger.debug('readContentFromGit => url:', url);
    const defaultOptions: RequestOptions = {
      rejectUnauthorized: false,
      dataType: 'text',
      timeout: 10 * 1000,
      method: 'GET',
    };
    const res = await urllib.request(url, defaultOptions);
    if (res.status >= 400) {
      throw new HttpException(res, res.status);
    }
    return res.data;
  }

  async getContracts(lang?: Lang): Promise<Contract[]> {
    let result = await this.readContentFromMinIO(lang).catch(() => null);
    if (!result) {
      result = await this.readContentFromGit(lang);
    }
    try {
      return JSON.parse(result);
    } catch (error) {
      this.logger.error('getContracts', error);
      return null;
    }
  }

  async importContract(
    auth: JwtAuth,
    name: string,
    network: string,
  ): Promise<boolean> {
    // 0. 获取详情
    const contracts = await this.getContracts(Lang.en);
    const contract = contracts?.find((d) => d.name === name);
    if (!contract) {
      throw new CustomException(
        'FORBIDDEN_CONTRACT_NOT_EXIST',
        'the contract does not exist',
        HttpStatus.FORBIDDEN,
      );
    }
    // 1. 校验该网络中此合约是否已存在
    const { version, description, package: pkg } = contract;
    const ccbs = await this.ccbService.getChaincodebuilds(auth, {
      id: name,
      network,
      version,
    });
    if (ccbs?.length > 0) {
      return true;
    }
    // 2. 复制官方合约到MinIO bestchains中，并修改其Dockerfile
    const timestampName = await this.copyContractFilesToMinIO();
    await this.modifyContractDockerfileToMinIO(timestampName, pkg);

    // 2. 创建合约
    await this.ccbService.createChaincodebuildCR(auth, timestampName, {
      network,
      version,
      description,
      displayName: name,
    });
    return true;
  }

  // 替换MinIO中bestchains-contracts的Dockerfile文件
  async modifyContractDockerfileToMinIO(
    dirName: string,
    contractPkg: string,
  ): Promise<boolean> {
    const objectName = `${dirName}/Dockerfile`;
    const tempFile = '/tmp/Dockerfile';

    await this.minioService.fgetObject(MINIO_BUCKET_NAME, objectName, tempFile);
    const content = fs.readFileSync(tempFile, 'utf-8');
    const newContent = content
      .replace('hyperledgerk8s', this.imgConfig.namespace)
      .replace('examples/basic', contractPkg)
      .replace('FROM golang:', `FROM ${this.imgConfig.namespace}/golang:`);
    fs.writeFileSync(tempFile, newContent);
    await this.minioService.fputObject(MINIO_BUCKET_NAME, objectName, tempFile);
    return true;
  }

  // 复制官方合约到MinIO bestchains中
  async copyContractFilesToMinIO(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const stream = this.minioService.listObjects(
          BESTCHAINS_CONTRACTS_BUCKET,
          'bestchains-contracts/',
        );
        const objs = [];
        stream.on('data', (obj) => {
          objs.push(obj);
        });
        stream.on('end', async () => {
          let isFirst = false;
          let objectName: string;
          for (const obj of objs) {
            const fileName = obj.name;
            if (!isFirst) {
              objectName = `${fileName?.split('/')[0]}-${Date.now()}`;
              isFirst = true;
            }
            const hashFileName = fileName.replace(
              /^([^/]+)(\/.*)$/,
              `${objectName}$2`,
            );
            await this.minioService.copyObject(
              MINIO_BUCKET_NAME,
              hashFileName,
              `${BESTCHAINS_CONTRACTS_BUCKET}/${fileName}`,
            );
          }
          this.logger.debug('Copy files is done');
          resolve(objectName);
        });
        stream.on('error', (err) => {
          this.logger.error('minio error: ', err);
          throw new InternalServerErrorException(
            'Failed to copy files from minIO.',
          );
        });
      } catch (error) {
        this.logger.error(error);
        reject(error);
      }
    });
  }
}
