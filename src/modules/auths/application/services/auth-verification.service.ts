import { Injectable } from "@nestjs/common";
import { IssueEmailTokenParams, EmailPurpose } from "../../interface/dto/auth-verification.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { CreateOneTimeTokenCommand } from "../command/create-one-time-token.command";
import { SendEmailVerificationCommand } from "../command/send-email-verification.command";
import { TokenFactory } from "./token.factory";
import { VerifyTokenRequest } from "../../interface/dto/auth.dto";
import { FindByHashAndPurposeQuery } from "../query/find-by-hash-and-purpose.query";
import { BadRequestException } from "../exceptions/auth.exception";
import { UpdateUsedAtOneTimeTokenCommand } from "../command/update-used-at-one-time-token.command";
import { OneTimeTokenEntity } from "../../infrastructure/persistence/entities/one-time-token.entity";

@Injectable()
export class AuthVerificationService {
  constructor(
    private readonly config: ConfigService,
    private readonly tokenFactory: TokenFactory,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async issueEmailToken(params: IssueEmailTokenParams): Promise<void> {
    const { raw, tokenHash, expiresAt } = this.tokenFactory.generate(params.purpose);
    const { user_id, email, purpose } = params;
    const payloadCreateOneTimeToken = {
      user_id,
      purpose,
      token_hash: tokenHash,
      expires_at: expiresAt,
    };
    await this.commandBus.execute(
      new CreateOneTimeTokenCommand(payloadCreateOneTimeToken)
    );

    const verifyUrl = this.tokenFactory.buildVerifyUrl(
      this.config.get('EMAIL_VERIFY_URL')!,
      raw,
      purpose,
    )
    const payloadSendEmailVerification = {
      email,
      purpose,
      verifyUrl: verifyUrl.toString(),
      expiresAt: expiresAt.toISOString(),
    };
    await this.commandBus.execute(
      new SendEmailVerificationCommand(payloadSendEmailVerification)
    );
  }

  async verifyToken(body: VerifyTokenRequest): Promise<OneTimeTokenEntity> {
    const now = new Date();
    const tokenHash = this.tokenFactory.hasher(body.token);
    const rec = await this.queryBus.execute(
      new FindByHashAndPurposeQuery(tokenHash, body.purpose)
    )

    if(!rec)                  throw new BadRequestException('Invalid token');
    if(rec.used_at)           throw new BadRequestException('Token already used');
    if(rec.expires_at <= now) throw new BadRequestException('Expired token');

    const updated = await this.commandBus.execute(
      new UpdateUsedAtOneTimeTokenCommand(rec.id, now)
    );

    if(!updated) throw new BadRequestException('Invalid token');
    return updated;
  }
}
