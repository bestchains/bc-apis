import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as urllib from 'urllib';
import * as jwt from 'jsonwebtoken';
import oidcConfig from './config/oidc.config';
import { UsersService } from './users/users.service';
import { IS_PROD, K8S_SA_TOKEN_PATH, USER_GROUPS } from './common/utils';
import kubernetesConfig from './config/kubernetes.config';
import { readFileSync } from 'fs';

@Injectable()
export class AppService {
  constructor(
    @Inject(oidcConfig.KEY) private oidc: ConfigType<typeof oidcConfig>,
    @Inject(kubernetesConfig.KEY)
    private k8sConfig: ConfigType<typeof kubernetesConfig>,
    private readonly userService: UsersService,
  ) {}

  private logger = new Logger('appService');

  getHello(): string {
    return 'bc-apis is running.';
  }

  getOidcAuthUrl() {
    const {
      client: { client_id, redirect_uri },
      server: { url },
    } = this.oidc;
    const searchParams = new URLSearchParams({
      client_id,
      redirect_uri,
      response_type: 'code',
      scope: 'openid profile email offline_access',
    });
    return url + '/auth?' + searchParams.toString();
  }

  async getOidcToken(code: string) {
    const {
      client: { client_id, client_secret, redirect_uri },
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

  decodeToken(token: string) {
    const decodedToken = jwt.decode(token, { complete: true });
    return decodedToken.payload as jwt.JwtPayload;
  }

  async updateUserGroup({ name, token, tokenType }) {
    if (IS_PROD) {
      try {
        this.k8sConfig.bffSaToken = readFileSync(K8S_SA_TOKEN_PATH).toString();
      } catch (error) {
        this.logger.error('read service account token failed', error);
      }
    }
    const { groups } = await this.userService.getUserByName(
      { token: this.k8sConfig.bffSaToken || token, tokenType },
      name,
    );
    if (USER_GROUPS.every((group) => groups.includes(group))) {
      return;
    }
    return this.userService.updateUser(
      { token: this.k8sConfig.bffSaToken || token, tokenType },
      name,
      {
        groups: [...new Set([...groups, ...USER_GROUPS])],
      },
    );
  }
}
