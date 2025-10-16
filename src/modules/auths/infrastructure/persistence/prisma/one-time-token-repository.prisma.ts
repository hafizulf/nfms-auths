import { Injectable } from "@nestjs/common";
import { OneTimeTokenRepository } from "../repository/one-time-token-repository.interface";
import { PrismaService } from "src/modules/prisma/services/prisma.service";
import { CreateOneTimeToken } from "src/modules/auths/interface/dto/auth-verification.dto";
import { OneTimeTokenEntity } from "../entities/one-time-token.entity";
import { uuidv7 } from "uuidv7";
import { OneTimeTokenMapper } from "../entities/one-time-token.mapper";

@Injectable()
export class OneTimeTokenRepositoryPrisma
implements OneTimeTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateOneTimeToken): Promise<OneTimeTokenEntity> {
    const rec = await this.prisma.oneTimeToken.create({
      data: {
        id: uuidv7(),
        ...payload,
      },
    });

    return OneTimeTokenMapper.fromPrisma(rec);
  }
}
