import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindByUserIdAndPurposeQuery } from "../query/find-by-userId-and-purpose.query";
import { OneTimeTokenEntity } from "../../infrastructure/persistence/entities/one-time-token.entity";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";
import { OneTimeTokenRepository } from "../../infrastructure/persistence/repository/one-time-token-repository.interface";

@QueryHandler(FindByUserIdAndPurposeQuery)
export class FindByUserIdAndPurposeHandler
implements IQueryHandler<FindByUserIdAndPurposeQuery, OneTimeTokenEntity | null> {
  constructor(
    @Inject(REPOSITORY_TYPES.ONE_TIME_TOKEN_REPOSITORY)
    private readonly repository: OneTimeTokenRepository,
  ) {}
  async execute(query: FindByUserIdAndPurposeQuery): Promise<OneTimeTokenEntity | null> {
    return this.repository.findByUserIdAndPurpose(query.user_id, query.purpose);
  }
}
