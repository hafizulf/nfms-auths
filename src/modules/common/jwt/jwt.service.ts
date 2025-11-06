import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createLocalJWKSet, JWK, jwtVerify, SignJWT } from 'jose';
import { KeyStore } from 'src/crypto/key-store';
import { AppException } from 'src/modules/auths/application/exceptions/app.exception';
import { ERROR_CODES } from 'src/modules/auths/application/exceptions/auth-error-codes.exception';

type Dict = Record<string, unknown>;

export interface AccessPayload extends Dict { sub: string }
export interface RefreshPayload extends Dict { sub: string; refreshTtlSec?: true }
export interface SignedToken { token: string; expiresAt: number }

@Injectable()
export class JWTService implements OnModuleInit {
  private _issuer: string;
  private _audience: string;
  private _accessTtlSec: number;
  private _accessJwks: ReturnType<typeof createLocalJWKSet>; // local JWKS for verification
  private _refreshTtlSec: number;
  private _refreshSecretBytes: Uint8Array;

  constructor(
    private readonly config: ConfigService,
    private readonly keys: KeyStore,
  ) {}

  onModuleInit() {
    this._issuer = this.config.get('JWT_ISSUER') ?? 'auth.svc';
    this._audience = this.config.get('JWT_AUDIENCE') ?? 'internal';

    this._accessTtlSec = Number(this.config.get('JWT_EXPIRATION_TIME'));
    // Build a local JWKS (verifier) from our public JWK so we can verify access locally if needed
    const jwks = this.keys.publicJwks() as { keys: JWK[] };
    this._accessJwks = createLocalJWKSet(jwks);

    this._refreshTtlSec = Number(this.config.get('JWT_REFRESH_EXPIRATION_TIME'));
    this._refreshSecretBytes = new TextEncoder().encode(this.config.get('JWT_REFRESH_SECRET'));
  }

  get accessTtlSec() { return this._accessTtlSec; }
  get refreshTtlSec() { return this._refreshTtlSec; }
  get issuer() { return this._issuer; }
  get audience() { return this._audience; }

  // ACCESS: RS256 with private key, header carries kid
  async signAccess(payload: AccessPayload, opts?: { extra?: Dict }): Promise<SignedToken> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this._accessTtlSec;

    const token = await new SignJWT({ ...payload, typ: 'access', ...(opts?.extra ?? {}) })
      .setProtectedHeader({ alg: 'RS256', kid: this.keys.getKid() })
      .setIssuer(this._issuer)
      .setAudience(this._audience)
      .setSubject(payload.sub)
      .setJti(randomUUID())
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(this.keys.getPrivateKey());

    return { token, expiresAt: exp };
  }

  // REFRESH: HS256 with shared secret (Auth-only)
  async signRefresh(payload: RefreshPayload, opts?: { extra?: Dict }): Promise<SignedToken> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this._refreshTtlSec;

    const token = await new SignJWT({ ...payload, typ: 'refresh', ...(opts?.extra ?? {}) })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(this._issuer)
      .setAudience(this._audience)
      .setSubject(payload.sub)
      .setJti(randomUUID())
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(this._refreshSecretBytes);

    return { token, expiresAt: exp };
  }

  // ACCESS: verify via local JWKS (same logic other services will use remotely)
  async verifyAccess<T extends Dict = AccessPayload>(token: string): Promise<T> {
    const { payload, protectedHeader } = await jwtVerify(token, this._accessJwks, {
      issuer: this._issuer,
      audience: this._audience,
      algorithms: ['RS256'],
      clockTolerance: 5,
    });
    if (payload.typ !== 'access') throw new AppException(ERROR_CODES.INVALID_TOKEN, 'Invalid token type for access');
    // optional: enforce kid exists
    if (!protectedHeader.kid) throw new AppException(ERROR_CODES.MISSING_KID, 'Missing kid in access token');
    return payload as T;
  }

  // REFRESH: verify using HS256 secret (Auth-only)
  async verifyRefresh<T extends Dict = RefreshPayload>(token: string): Promise<T> {
    const { payload } = await jwtVerify(token, this._refreshSecretBytes, {
      issuer: this._issuer,
      audience: this._audience,
      algorithms: ['HS256'],
      clockTolerance: 5,
    });
    if (payload.typ !== 'refresh') throw new AppException(ERROR_CODES.INVALID_TOKEN, 'Invalid token type for refresh');
    return payload as T;
  }

  // utility
  decodeUnsafe<T = any>(token: string): T | null {
    try {
      const [, payloadB64] = token.split('.');
      if (!payloadB64) return null;
      const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
      return JSON.parse(json) as T;
    } catch { return null; }
  }
}
