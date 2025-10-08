import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

type Dict = Record<string, unknown>;

export interface AccessPayload extends Dict { sub: string }
export interface RefreshPayload extends Dict { sub: string; refreshTtlSec?: true }
export interface SignedToken { token: string; expiresAt: number }

@Injectable()
export class JWTService implements OnModuleInit {
  private _accessSecretKey: string;
  private _accessTtlSec: number;
  private _refreshSecretKey: string;
  private _refreshTtlSec: number;
  private _issuer: string;
  private _audience: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this._accessSecretKey = this.config.get('JWT_SECRET')!;
    this._refreshSecretKey = this.config.get('JWT_REFRESH_SECRET')!;
    this._accessTtlSec = Number(this.config.get('JWT_EXPIRATION_TIME'));
    this._refreshTtlSec = Number(this.config.get('JWT_REFRESH_EXPIRATION_TIME'));
    this._issuer = this.config.get('JWT_ISSUER') ?? 'auth';
    this._audience = this.config.get('JWT_AUDIENCE') ?? 'web';
  }

  get accessSecretKey() { return this._accessSecretKey; }
  get refreshSecretKey() { return this._refreshSecretKey; }
  get accessTtlSec() { return this._accessTtlSec; }
  get refreshTtlSec() { return this._refreshTtlSec; }
  get issuer() { return this._issuer; }
  get audience() { return this._audience; }

  // signing
  signAccess(payload: AccessPayload, opts?: Partial<jwt.SignOptions>): SignedToken {
    return this._signGeneric(payload, this._accessSecretKey, this._accessTtlSec, opts);
  }
  signRefresh(payload: RefreshPayload, opts?: Partial<jwt.SignOptions>): SignedToken {
    const withMarker = { ...payload, refreshTtlSec: true as const };
    return this._signGeneric(withMarker, this._refreshSecretKey, this._refreshTtlSec, opts);
  }

  private _signGeneric(payload: Dict, secret: string, ttlSec: number, opts?: Partial<jwt.SignOptions>): SignedToken {
    const nowSec = Math.floor(Date.now() / 1000);
    const exp = nowSec + ttlSec;
    const token = jwt.sign(payload, secret, {
      algorithm: 'HS256',
      issuer: this._issuer,
      audience: this._audience,
      expiresIn: ttlSec,
      jwtid: randomUUID(),
      ...opts,
    });

    return { token, expiresAt: exp };
  }

  // verification
  verifyAccess<T extends Dict = AccessPayload>(token: string): T {
    return this._verifyGeneric<T>(token, this._accessSecretKey, { requireRt: false });
  }
  verifyRefresh<T extends Dict = RefreshPayload>(token: string): T {
    return this._verifyGeneric<T>(token, this._refreshSecretKey, { requireRt: true });
  }
  private _verifyGeneric<T extends Dict>(token: string, secret: string, opts: { requireRt: boolean }): T {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: this._issuer,
      audience: this._audience,
      clockTolerance: 5,
    }) as T;
    if (opts.requireRt && (decoded as any)?.rt !== true) {
      const err = new jwt.JsonWebTokenError('Invalid token type');
      (err as any).code = 'INVALID_TOKEN_TYPE';
      throw err;
    }
    return decoded;
  }

  // utility
  decodeUnsafe<T = any>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }
}
