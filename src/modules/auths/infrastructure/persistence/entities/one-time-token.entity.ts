import { EmailPurpose } from "src/modules/auths/interface/dto/auth-verification.dto";

export class OneTimeTokenEntity {
  private constructor(
    private _id: string,
    private _user_id: string,
    private _purpose: EmailPurpose,
    private _token_hash: Buffer,
    private _expires_at: Date,
    private _used_at: Date | null,
    private _created_at: Date,
  ) {}

  static create(
    id: string,
    user_id: string,
    purpose: EmailPurpose,
    token_hash: Buffer,
    expires_at: Date,
    now = new Date(),
  ): OneTimeTokenEntity {
    return new OneTimeTokenEntity(id, user_id, purpose, token_hash, expires_at, now, now);
  }

  static rehydrate(p: {
    id: string;
    user_id: string;
    purpose: EmailPurpose;
    token_hash: Buffer;
    expires_at: Date;
    used_at: Date | null;
    created_at: Date;
  }): OneTimeTokenEntity {
    return new OneTimeTokenEntity(
      p.id,
      p.user_id,
      p.purpose,
      p.token_hash,
      p.expires_at,
      p.used_at,
      p.created_at,
    );
  }

  get id(): string {
    return this._id;
  }
  get user_id(): string {
    return this._user_id;
  }
  get purpose(): EmailPurpose {
    return this._purpose;
  }
  get token_hash(): Buffer {
    return this._token_hash;
  }
  get expires_at(): Date {
    return this._expires_at;
  }
  get used_at(): Date | null {
    return this._used_at;
  }
  get created_at(): Date {
    return this._created_at;
  }
}
