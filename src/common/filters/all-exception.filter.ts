import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { formatApolloErrors } from 'apollo-server-core';
import { genUserLogString, GraphQLException, TokenException } from '../utils';

@Catch()
export class AllExceptionFilter implements GqlExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const httpHost = gqlHost.switchToHttp();
    const contextType = (httpHost as any).contextType;
    const { httpAdapter } = this.httpAdapterHost;
    const {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
      body = '-',
      response,
    } = exception;
    const responseMsg = `${response?.request?.method || '-'} ${
      response?.request?.href || '-'
    } [${statusCode}] ${
      typeof body === 'object' ? JSON.stringify(body) : body
    } => `;
    if (contextType !== 'http') {
      const ctx = gqlHost.getContext();
      const req = ctx.req;
      Logger.error(
        responseMsg + exception.stack,
        req && genUserLogString(req),
        req?.body?.query,
      );
      return exception;
    }
    // 当收到非标准 GraphQLException 时，需要进行格式化
    if (!exception.extensions?.exception) {
      if (exception.body) {
        const { statusCode } = exception;
        const { body } = exception;
        if (
          typeof body === 'string' &&
          statusCode === 401 &&
          body.trim() === 'Unauthorized'
        ) {
          exception = new TokenException(body, exception);
        } else {
          exception = new GraphQLException(
            body.message || 'unknown error',
            statusCode,
            Object.assign({}, exception, body.details),
          );
        }
      }
      if (exception.extensions?.exception) {
        exception.extensions.exception.stacktrace = exception.stack.split('\n');
      }
      if (exception.response) {
        exception.originalError = exception.response;
      }
    }
    const req = httpHost.getRequest();
    Logger.error(
      responseMsg + exception.stack,
      req && genUserLogString(req),
      req?.body?.query,
    );
    return httpAdapter.reply(
      httpHost.getResponse(),
      {
        data: null,
        errors: formatApolloErrors([exception]),
      },
      200,
    );
  }
}
