import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';
import { FederationModule } from './federation/federation.module';
import { ConfigModule } from '@nestjs/config';
import kubernetesConfig from './config/kubernetes.config';
import oidcConfig from './config/oidc.config';
import iamProviderConfig from './config/iam-provider.config';
import { JwtMiddleware } from './common/middleware/jwt.middleware';
import { KubernetesModule } from './kubernetes/kubernetes.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { LoggingPlugin } from './common/plugins/logging.plugin';
import { UsersModule } from './users/users.module';
import { OrganizationModule } from './organization/organization.module';
import { ProposalModule } from './proposal/proposal.module';
import { VoteModule } from './vote/vote.module';
import { NetworkModule } from './network/network.module';
import { DataLoaderInterceptor } from './common/dataloader';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Response } from 'express';
import { JSONObjectScalar, JSONScalar } from './common/scalars/json.scalar';

const GRAPHQL_PATH = '/bff';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: GRAPHQL_PATH,
      // 生产环境是否允许获取 schemas
      introspection: true,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      cors: {
        origin: true,
        allowedHeaders: ['Authorization'],
      },
      playground: {
        settings: {
          'request.credentials': 'same-origin',
          'tracing.hideTracingResponse': true,
          'queryPlan.hideQueryPlanResponse': true,
          'schema.polling.interval': 1000 * 60,
        },
      },
      subscriptions: {
        'graphql-ws': {
          path: GRAPHQL_PATH,
        },
      },
    }),
    ConfigModule.forRoot({
      load: [kubernetesConfig, oidcConfig, iamProviderConfig],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: [GRAPHQL_PATH],
      serveStaticOptions: {
        setHeaders: (res: Response) => {
          const url = res.req.url;
          if (
            url.includes('.') &&
            !url.startsWith('/profile/') &&
            !url.endsWith('.html') &&
            url !== '/favicon.ico'
          ) {
            res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
          }
        },
      },
    }),
    KubernetesModule,
    FederationModule,
    UsersModule,
    OrganizationModule,
    ProposalModule,
    VoteModule,
    NetworkModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    LoggingPlugin,
    JSONScalar,
    JSONObjectScalar,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(GRAPHQL_PATH);
  }
}
