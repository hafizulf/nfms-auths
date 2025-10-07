import { Module } from "@nestjs/common";
import { AuthHttpController } from "./interface/auth-http.controller";
import { AuthService } from "./application/services/auth.service";
import { UsersGrpcModule } from "../users-grpc/users-grpc.module";

@Module({
  imports: [
    UsersGrpcModule,
  ],
  controllers: [
    AuthHttpController,
  ],
  providers: [
    AuthService,
  ],
})
export class AuthModule {}
