import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import {
  importPKCS8,
  importSPKI,
  exportJWK,
  calculateJwkThumbprint,
  JWK,
} from 'jose';

@Injectable()
export class KeyStore implements OnModuleInit {
  private privateKey!: CryptoKey;
  private publicJwk!: JWK;
  private kid!: string;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const privPem = fs.readFileSync(this.config.get<string>('JWT_PRIVATE_KEY_PATH')!, 'utf8');
    const pubPem  = fs.readFileSync(this.config.get<string>('JWT_PUBLIC_KEY_PATH')!, 'utf8');

    this.privateKey = await importPKCS8(privPem, 'RS256'); // sign

    const publicKey = await importSPKI(pubPem, 'RS256');   // verify / JWKS
    this.publicJwk = await exportJWK(publicKey);

    this.kid = await calculateJwkThumbprint(this.publicJwk, 'sha256');
  }

  getPrivateKey() {
    return this.privateKey;
  }

  getKid() {
    return this.kid;
  }

  publicJwks() {
    return {
      keys: [
        {
          ...this.publicJwk,
          use: 'sig',
          alg: 'RS256',
          kid: this.kid,
        },
      ],
    };
  }
}
