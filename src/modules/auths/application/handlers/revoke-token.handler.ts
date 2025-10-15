import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RevokeTokenCommand } from "../command/revoke-token.command";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";
import { TokenRepository } from "../../infrastructure/persistence/repository/token-repository-interface";

@CommandHandler(RevokeTokenCommand)
export class RevokeTokenHandler 
implements ICommandHandler<RevokeTokenCommand, void> {
  constructor(
    @Inject(REPOSITORY_TYPES.TOKEN_REPOSITORY) private readonly _tokenRepository: TokenRepository,
  ) {}
  async execute(command: RevokeTokenCommand): Promise<void> {
    return await this._tokenRepository.revoke(command.refreshToken);
  }
}
