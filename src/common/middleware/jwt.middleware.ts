import { Injectable, NestMiddleware } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { Request, Response, NextFunction } from 'src/types';
import { getAuthFromToken } from '../utils';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    req.__reqId = nanoid();
    const { authorization } = req.headers;
    if (authorization) {
      const [tokenType, token] = authorization.split(/\s/);
      req.auth = getAuthFromToken(token);
      req.auth.tokenType = tokenType;
      req.auth.ip = req.ip;
    }
    next();
  }
}
