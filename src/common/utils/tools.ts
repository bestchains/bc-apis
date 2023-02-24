import * as jwt from 'jsonwebtoken';
import { Jwt } from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import { numbers, lowercase } from 'nanoid-dictionary';
import { TokenException } from './errors';
import type { JwtAuth, Request } from '../../types';
import { compact, uniq } from 'lodash';

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

/**
 * 首字母大写
 */
export const initialToUpperCase = (value: string) =>
  (value || '').replace(/^(\w)/, (_, $0) => $0.toUpperCase());

/**
 * 将命名转换为横线命名
 * TwoWords => two-words
 *
 * @param {string} name 名称
 */
export const camelCaseToKebabCase = (name: string) =>
  (name || '')
    .replace(/([A-Z])/g, '-$1')
    .replace(/^\-/, '')
    .toLocaleLowerCase();
/**
 * Base64 转码 encode
 */
export const encodeBase64 = (value: string) =>
  Buffer.from(value || '').toString('base64');

/**
 * Base64 转码 decode
 */
export const decodeBase64 = (value: string) =>
  Buffer.from(value || '', 'base64').toString('utf-8');

export const nanoid = customAlphabet(numbers + lowercase, 5);

/**
 * 生成带前缀的短 id
 * @param {string} prefix 前缀
 * @returns
 */
export const genNanoid = (prefix: string) => `${prefix}-${nanoid()}`;

/**
 * 多层级数组平铺去重
 * @param {string[][]} arr
 */
export const flattenArr = (arr: string[][]) => uniq(compact(arr.flat()));
