import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestListener,
} from 'apollo-server-plugin-base';
import { Request } from '../../types';
import { genUserLogString } from '../utils';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(context: BaseContext): Promise<GraphQLRequestListener> {
    const req: Request = context.context.req;
    const startTime = Date.now();
    const userLogStr = `[${genUserLogString(req)}]`;
    const operationName = req.body?.operationName || '-';
    const query = req.body?.query || '-';
    if (operationName === 'IntrospectionQuery') {
      return;
    }
    Logger.log(`--> ${userLogStr}`);
    Logger.debug(`--> ${userLogStr} ${query}`, req.body?.variables);
    return {
      async willSendResponse() {
        const time = Date.now() - startTime;
        Logger.log(`<-- ${userLogStr} ${time}ms`);
      },
    };
  }
}
