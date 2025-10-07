import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'USERS_GRPC',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get<string>('USERS_GRPC_URL'),
            package: 'user',
            protoPath: join(__dirname, '../../protos/user.proto'),
          }
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class UsersGrpcModule {}
