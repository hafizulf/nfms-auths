import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateOneTimeTokenCommand } from "../command/create-one-time-token.command";
import { OneTimeTokenEntity } from "../../infrastructure/persistence/entities/one-time-token.entity";
import { Inject } from "@nestjs/common";
import { REPOSITORY_TYPES } from "../../infrastructure/persistence/repository/repository.types";
import { OneTimeTokenRepository } from "../../infrastructure/persistence/repository/one-time-token-repository.interface";

@CommandHandler(CreateOneTimeTokenCommand)
export class CreateOneTimeTokenHandler 
implements ICommandHandler<CreateOneTimeTokenCommand, OneTimeTokenEntity> {
  constructor(
    @Inject(REPOSITORY_TYPES.ONE_TIME_TOKEN_REPOSITORY) 
    private readonly _oneTimeTokenRepository: OneTimeTokenRepository,
  ) {}

  async execute(command: CreateOneTimeTokenCommand): Promise<OneTimeTokenEntity> {
    return await this._oneTimeTokenRepository.create(command.payload)
  }
}
