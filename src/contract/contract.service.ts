import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  BESTCHAINS_CONTRACTS_BUCKET,
  BESTCHAINS_CONTRACTS_GIT,
} from 'src/common/utils';
import { RequestOptions } from 'urllib';
import * as urllib from 'urllib';
import { Contract } from './models/contract.model';
import { MinioService } from 'src/minio/minio.service';
import { Lang } from './models/Lang.enum';

@Injectable()
export class ContractService {
  constructor(private readonly minioService: MinioService) {}

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
        dataStream.on('data', (chunk) => {
          chunks.push(chunk);
        });
        dataStream.on('end', () => {
          resolve(chunks.toString());
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
}
