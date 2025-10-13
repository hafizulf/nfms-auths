import { Token } from 'generated/prisma';
import { TokenEntity } from './token.entity';

export class TokenMapper {
  static fromPrisma(row: Token): TokenEntity {
    return TokenEntity.rehydrate({
      id: row.id,
      user_id: row.user_id,
      token: row.token,
      is_revoked: row.is_revoked,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
}
