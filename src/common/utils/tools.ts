import * as jwt from 'jsonwebtoken';
import { Jwt } from 'jsonwebtoken';
import { TokenException } from './errors';
import type { JwtAuth, Request } from '../../types';

/**
 * 从 token 中解析用户认证信息
 */
export const getAuthFromToken = (token: string): JwtAuth => {
  let decodedToken: Jwt;
  try {
    decodedToken = jwt.decode(token, { complete: true });
  } catch (error) {
    throw new TokenException('invalid token', error);
  }
  if (!decodedToken?.payload || typeof decodedToken.payload === 'string') {
    throw new TokenException('invalid token', decodedToken);
  }
  const auth = {
    ...(decodedToken.payload as any),
    token,
  };
  // 以 preferred_username 为准
  auth.__name = auth.name;
  auth.name = auth.preferred_username;
  return auth;
};

/**
 * 生成当前用户的日志字符串
 * @param req request 对象
 */
export const genUserLogString = (req: Request) => {
  const { auth, ip = '-', __reqId, method, baseUrl, body } = req;
  const operationName = body?.operationName || '-';
  let userRoleIp = '';
  if (!auth) {
    userRoleIp = `N/A@${ip}`;
  } else {
    const { name, role = 'N/A' } = auth;
    userRoleIp = `${name}(${role})@${ip}`;
  }
  return `${userRoleIp} [${__reqId}] ${method} ${baseUrl} ${operationName}`;
};
