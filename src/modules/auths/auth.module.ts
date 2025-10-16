import { Module } from "@nestjs/common";
import { AuthHttpController } from "./interface/auth-http.controller";
import { AuthService } from "./application/services/auth.service";
import { UsersGrpcModule } from "../users-grpc/users-grpc.module";
import { JWTModule } from "../common/jwt/jwt.module";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthHandlers } from "./application/handlers";
import { REPOSITORY_TYPES } from "./infrastructure/persistence/repository/repository.types";
import { TokenRepositoryPrisma } from "./infrastructure/persistence/prisma/token-repository.prisma";
import { PrismaService } from "../prisma/services/prisma.service";
import { OneTimeTokenRepositoryPrisma } from "./infrastructure/persistence/prisma/one-time-token-repository.prisma";
import { AuthVerificationService } from "./application/services/auth-verification.service";
import { TokenFactory } from "./application/services/token.factory";
import { RabbitMQInfraModule } from "./infrastructure/rabbitmq/rabbitmq-infra.module";

@Module({
  imports: [
    UsersGrpcModule,
    JWTModule,
    CqrsModule,
    RabbitMQInfraModule,
  ],
  controllers: [
    AuthHttpController,
  ],
  providers: [
    {
      provide: REPOSITORY_TYPES.TOKEN_REPOSITORY,
      useClass: TokenRepositoryPrisma,
    },
    {
      provide: REPOSITORY_TYPES.ONE_TIME_TOKEN_REPOSITORY,
      useClass: OneTimeTokenRepositoryPrisma,
    },
    PrismaService,
    TokenFactory,
    AuthVerificationService,
    AuthService,
    ...AuthHandlers,
  ],
})
export class AuthModule {}
