import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { initialToUpperCase } from '../common/utils';
import { JwtAuth } from '../types';
import { ConfigType } from '@nestjs/config';
import * as urllib from 'urllib';
import { RequestOptions } from 'urllib';
import { IncomingHttpHeaders } from 'http';
import iamProviderConfig from 'src/config/iam-provider.config';
import { User } from './models/user.model';

type PickJwtAuth = Pick<JwtAuth, 'token' | 'tokenType'>;

@Injectable()
export class UsersService {
  constructor(
    @Inject(iamProviderConfig.KEY)
    private config: ConfigType<typeof iamProviderConfig>,
  ) {}

  logger = new Logger('UsersService');

  async callIamApi(
    endpoint: string,
    auth?: Pick<JwtAuth, 'token' | 'tokenType'>,
    options?: RequestOptions,
  ) {
    const { url } = this.config.server;
    const headers: IncomingHttpHeaders = {
      'content-type': 'application/json',
    };
    if (auth) {
      const { token, tokenType } = auth;
      headers.Authorization = `${initialToUpperCase(tokenType)} ${token}`;
    }
    const reqUrl = url + endpoint;
    Logger.debug('callIamApi => url:', reqUrl);
    Logger.debug('callIamApi => options:', options);
    const defaultOptions: RequestOptions = {
      rejectUnauthorized: false,
      dataType: 'json',
      timeout: 10 * 1000,
      headers,
    };
    const res = await urllib.request(
      reqUrl,
      Object.assign({}, defaultOptions, options),
    );
    if (res.status >= 400) {
      throw new HttpException(res, res.status);
    }
    return res;
  }

  async getUsers(auth: JwtAuth): Promise<User[]> {
    const { data } = await this.callIamApi(`/user`, auth, {
      method: 'GET',
    });
    return data;
  }

  async getUserByName(auth: PickJwtAuth, name: string): Promise<User> {
    const { data } = await this.callIamApi(`/user/${name}`, auth, {
      method: 'GET',
    });
    return data;
  }

  async updateUser(auth: PickJwtAuth, name: string, user: UpdateUserInput) {
    const res = await this.callIamApi(`/user`, auth, {
      method: 'PUT',
      data: {
        ...user,
        name,
      },
    });
    return res.data;
  }
}
