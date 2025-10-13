import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateTokenCommand } from "../command/create-token.command";
import { TokenEntity } from "../../infrastructure/persistence/entities/token.entity";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";
import { TokenRepository } from "../../infrastructure/persistence/repository/token-repository-interface";

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler 
implements ICommandHandler<CreateTokenCommand, TokenEntity> {
  constructor(
    @Inject(REPOSITORY_TYPES.TOKEN_REPOSITORY) private readonly _tokenRepository: TokenRepository,
  ) {}

  async execute(command: CreateTokenCommand): Promise<TokenEntity> {
    return await this._tokenRepository.upsert(command.payload);
  }
}
