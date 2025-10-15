import { CreateTokenPayload } from "src/modules/auths/interface/dto/auth.dto";
import { TokenEntity } from "../entities/token.entity";

export abstract class TokenRepository {
  abstract upsert(data: CreateTokenPayload): Promise<TokenEntity>;
  abstract revoke(refreshToken: string): Promise<void>;
}
