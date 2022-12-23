import { Request as ExpressReq } from 'express';
export { Response, NextFunction } from 'express';

export * as K8s from '@kubernetes/client-node';

export interface JwtAuth {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  lat: number;
  at_hash: string;
  c_hash: string;
  email: string;
  email_verified: boolean;
  name: string;
  __name: string;
  preferred_username: string;
  tokenType: string;
  token: string;
  role: UserRole;
  ip: string;
}

export interface Request extends ExpressReq {
  auth?: JwtAuth;
  __reqId?: string;
}

export interface Labels {
  [k: string]: string;
}

export interface AnyObj {
  [k: string]: any;
}
