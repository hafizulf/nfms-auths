import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { buildHttpValidationPipe } from './modules/common/pipes/build-validation.pipe';
import { fastifyCookie } from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('APP_PORT') || 3002;

  await app.register(fastifyCookie, {
    secret: configService.get<string>('JWT_SECRET')!,
  });

  app.useGlobalPipes(buildHttpValidationPipe());

  await app.listen(appPort);

  console.log('Application is running on port:', appPort);
}
bootstrap();
