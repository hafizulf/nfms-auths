import { CreateOneTimeToken } from "src/modules/auths/interface/dto/auth-verification.dto";
import { OneTimeTokenEntity } from "../entities/one-time-token.entity";

export abstract class OneTimeTokenRepository {
  abstract create(payload: CreateOneTimeToken): Promise<OneTimeTokenEntity>;
  abstract findByHashAndPurpose(token: Buffer, purpose: string): Promise<OneTimeTokenEntity | null>;
  abstract updateUsedAt(id: string, usedAt: Date): Promise<OneTimeTokenEntity | null>;
}
