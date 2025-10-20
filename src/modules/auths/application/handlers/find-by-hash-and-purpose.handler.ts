import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindByHashAndPurposeQuery } from "../query/find-by-hash-and-purpose.query";
import { OneTimeTokenEntity } from "../../infrastructure/persistence/entities/one-time-token.entity";
import { OneTimeTokenRepository } from "../../infrastructure/persistence/repository/one-time-token-repository.interface";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";

@QueryHandler(FindByHashAndPurposeQuery)
export class FindByHashAndPurposeHandler 
implements IQueryHandler<FindByHashAndPurposeQuery, OneTimeTokenEntity | null> {
  constructor(
    @Inject(REPOSITORY_TYPES.ONE_TIME_TOKEN_REPOSITORY) 
    private readonly _oneTimeTokenRepository: OneTimeTokenRepository,
  ) {}

  async execute(query: FindByHashAndPurposeQuery): Promise<OneTimeTokenEntity | null> {
    const params = query;
    return await this._oneTimeTokenRepository.findByHashAndPurpose(params.tokenHashed, params.purpose);
  }
}
