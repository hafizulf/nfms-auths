import { Injectable } from "@nestjs/common";
import { TokenRepository } from "../repository/token-repository-interface";
import { CreateTokenPayload } from "src/modules/auths/interface/dto/auth.dto";
import { TokenEntity } from "../entities/token.entity";
import { PrismaService } from "src/modules/prisma/services/prisma.service";
import { TokenMapper } from "../entities/token.mapper";

@Injectable()
export class TokenRepositoryPrisma implements TokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: CreateTokenPayload): Promise<TokenEntity> {
    const rec = await this.prisma.token.upsert({
      where: { user_id: data.user_id },
      create: { user_id: data.user_id, token: data.token },
      update: { token: data.token, is_revoked: false, updated_at: new Date() },
    });
    return TokenMapper.fromPrisma(rec);
  }

  async revoke(refreshToken: string): Promise<void> {
    await this.prisma.token.update({
      where: { token: refreshToken },
      data: { is_revoked: true },
    });
  }

  async findByToken(token: string): Promise<TokenEntity | null> {
    const rec = await this.prisma.token.findFirst({
      where: { token },
    });
    if (!rec) return null;
    return TokenMapper.fromPrisma(rec);
  }
}
