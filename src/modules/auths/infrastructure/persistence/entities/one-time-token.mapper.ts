import { OneTimeToken } from "generated/prisma";
import { OneTimeTokenEntity } from "./one-time-token.entity";
import { EmailPurpose } from "src/modules/auths/interface/dto/auth-verification.dto";

export class OneTimeTokenMapper {
  static fromPrisma(row: OneTimeToken): OneTimeTokenEntity {
    return OneTimeTokenEntity.rehydrate({
      id: row.id,
      user_id: row.user_id,
      token_hash: Buffer.from(row.token_hash),
      purpose: row.purpose as EmailPurpose,
      expires_at: row.expires_at,
      used_at: row.used_at ?? null,
      created_at: row.created_at,
    });
  }
}
