import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindByTokenQuery } from "../query/find-by-token.query";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";
import { TokenRepository } from "../../infrastructure/persistence/repository/token-repository-interface";
import { TokenEntity } from "../../infrastructure/persistence/entities/token.entity";

@QueryHandler(FindByTokenQuery)
export class FindByTokenHandler 
implements IQueryHandler <FindByTokenQuery, TokenEntity | null> {
  constructor(
    @Inject(REPOSITORY_TYPES.TOKEN_REPOSITORY)
    private readonly repository: TokenRepository,
  ) {}

  async execute(query: FindByTokenQuery): Promise<TokenEntity | null> {
    return await this.repository.findByToken(query.token);
  }
}
