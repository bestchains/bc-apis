import { NestFactory } from '@nestjs/core';
import { LogLevel } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import * as ejs from 'ejs';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { AppModule } from './app.module';
import { IS_PROD, LOG_LEVELS } from './common/utils/constants';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: IS_PROD ? (LOG_LEVELS.split(',') as LogLevel[]) : undefined,
  });

  app.set('trust proxy', true);
  app.engine('html', ejs.renderFile);
  app.setBaseViewsDir(join(__dirname, '..', 'public'));
  app.setViewEngine('html');

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 30 }));

  await app.listen(8024);
  console.log(`bc-apis is running on: ${await app.getUrl()}`);
}
bootstrap();
