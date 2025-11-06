import { Module } from "@nestjs/common";
import { JWTService } from "./jwt.service";
import { JwksController } from "./jwks.controller";
import { KeyStore } from "src/crypto/key-store";

@Module({
  imports: [],
  controllers: [JwksController],
  providers: [
    JWTService,
    KeyStore,
  ],
  exports: [JWTService],
})
export class JWTModule {}
