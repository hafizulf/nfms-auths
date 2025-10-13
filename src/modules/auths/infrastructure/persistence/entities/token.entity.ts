export class TokenEntity {
  private constructor(
    private _id: string,
    private _user_id: string,
    private _token: string,
    private _is_revoked: boolean,
    private _created_at: Date,
    private _updated_at: Date,
  ) {}

  static create(
    id: string,
    user_id: string,
    token: string,
    is_revoked: boolean,
    now = new Date(),
  ): TokenEntity {
    return new TokenEntity(id, user_id, token, is_revoked, now, now);
  }

  static rehydrate(p: {
    id: string;
    user_id: string;
    token: string;
    is_revoked: boolean;
    created_at: Date;
    updated_at: Date;
  }): TokenEntity {
    return new TokenEntity(
      p.id,
      p.user_id,
      p.token,
      p.is_revoked,
      p.created_at,
      p.updated_at,
    );
  }

  // getters
  get id(): string {
    return this._id;
  }
  get user_id(): string {
    return this._user_id;
  }
  get token(): string {
    return this._token;
  }
  get is_revoked(): boolean {
    return this._is_revoked;
  }
  get created_at(): Date {
    return this._created_at;
  }
  get updated_at(): Date {
    return this._updated_at;
  }
}
