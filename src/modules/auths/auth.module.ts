import { Module } from "@nestjs/common";
import { AuthHttpController } from "./interface/auth-http.controller";
import { AuthService } from "./application/services/auth.service";
import { UsersGrpcModule } from "../users-grpc/users-grpc.module";
import { JWTModule } from "../common/jwt/jwt.module";

@Module({
  imports: [
    UsersGrpcModule,
    JWTModule,
  ],
  controllers: [
    AuthHttpController,
  ],
  providers: [
    AuthService,
  ],
})
export class AuthModule {}
