import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as urllib from 'urllib';
import oidcConfig from './config/oidc.config';
import { GetTokenDto } from './common/models/get-token.dto';
import { CLIENT_CONFIGURATION_PATH, IS_PROD } from './common/utils';
import { readFileSync } from 'fs';

@Injectable()
export class AppService {
  constructor(
    @Inject(oidcConfig.KEY) private oidc: ConfigType<typeof oidcConfig>,
  ) {}

  logger = new Logger('AppService');

  getHello(): string {
    return 'bc-apis is running.';
  }

  getOidcAuthUrl(redirect_uri: string) {
    const {
      client: { client_id },
      server: { url },
    } = this.oidc;
    const searchParams = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type: 'code',
    });
    return url + '/auth?' + searchParams.toString();
  }

  async getOidcToken(tokenDto: GetTokenDto) {
    const { code, redirect_uri } = tokenDto;
    const {
      client: { client_id, client_secret },
      server: { url },
    } = this.oidc;
    const res = await urllib.request(url + '/token', {
      method: 'POST',
      auth: client_id + ':' + client_secret,
      dataType: 'json',
      rejectUnauthorized: false,
      timeout: 10 * 1000,
      data: {
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      },
    });
    if (!res.data.id_token) {
      throw res.data;
    }
    return res.data;
  }

  async getClientConfiguration() {
    if (!IS_PROD) {
      return {};
    }
    try {
      const fileContent = readFileSync(CLIENT_CONFIGURATION_PATH).toString();
      return JSON.parse(fileContent);
    } catch (error) {
      this.logger.warn(`failed to get global configuration.`);
      return {};
    }
  }
}
