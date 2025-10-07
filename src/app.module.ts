import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { 
  EnvValidationOptions, 
  EnvValidationSchema, 
  formatEnvErrors 
} from './config/env-validation.config';
import { AuthModule } from './modules/auths/auth.module';

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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
