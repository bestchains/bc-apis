import { NestFactory } from '@nestjs/core';
import { LogLevel } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { IS_PROD, LOG_LEVELS } from './common/utils/constants';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: IS_PROD ? (LOG_LEVELS.split(',') as LogLevel[]) : undefined,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  await app.listen(8024);
  console.log(`bc-apis is running on: ${await app.getUrl()}`);
}
bootstrap();
