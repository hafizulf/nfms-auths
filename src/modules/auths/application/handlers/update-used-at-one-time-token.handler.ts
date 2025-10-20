import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUsedAtOneTimeTokenCommand } from "../command/update-used-at-one-time-token.command";
import { OneTimeTokenEntity } from "../../infrastructure/persistence/entities/one-time-token.entity";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";
import { OneTimeTokenRepository } from "../../infrastructure/persistence/repository/one-time-token-repository.interface";

@CommandHandler(UpdateUsedAtOneTimeTokenCommand)
export class UpdateUsedAtOneTimeTokenHandler 
implements ICommandHandler<UpdateUsedAtOneTimeTokenCommand, OneTimeTokenEntity | null> {
  constructor(
    @Inject(REPOSITORY_TYPES.ONE_TIME_TOKEN_REPOSITORY)
    private readonly oneTimeTokenRepository: OneTimeTokenRepository,
  ) {}
  async execute(command: UpdateUsedAtOneTimeTokenCommand): Promise<OneTimeTokenEntity | null> {
    return this.oneTimeTokenRepository.updateUsedAt(command.id, command.usedAt);
  }
}
