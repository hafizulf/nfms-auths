import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { 
  EnvValidationOptions, 
  EnvValidationSchema, 
  formatEnvErrors 
} from './config/env-validation.config';
import { AuthModule } from './modules/auths/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { AppExceptionHttpFilter } from './filters/app-exception.filter';
import { PrismaModule } from './modules/prisma/prisma.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: EnvValidationSchema,
      validationOptions: EnvValidationOptions,
      envFilePath: '.env',
      validate: (config) => {
        const result = EnvValidationSchema.safeParse(config);
        if (!result.success) {
          throw new Error(
            'Invalid environment variables: ' +
              JSON.stringify(formatEnvErrors(result.error), null, 2),
          );
        }
        return result.data;
      },
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { 
      provide: APP_FILTER, 
      useClass: AppExceptionHttpFilter, 
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
