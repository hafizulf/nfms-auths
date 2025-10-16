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
import { CommonModule } from "../common/common.module";

@Module({
  imports: [
    UsersGrpcModule,
    JWTModule,
    CqrsModule,
  ],
  controllers: [
    AuthHttpController,
  ],
  providers: [
    {
      provide: REPOSITORY_TYPES.TOKEN_REPOSITORY,
      useClass: TokenRepositoryPrisma,
    },
    PrismaService,
    AuthService,
    ...AuthHandlers,
  ],
})
export class AuthModule {}
