import { Controller, Get } from "@nestjs/common";
import { KeyStore } from "src/crypto/key-store";

@Controller('/.well-known')
export class JwksController {
  constructor(private readonly keyStore: KeyStore) {}

  @Get('jwks.json')
  jwks() {
    return this.keyStore.publicJwks();
  }
}
