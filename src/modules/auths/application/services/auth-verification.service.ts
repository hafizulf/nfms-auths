import { Injectable } from "@nestjs/common";
import { IssueEmailTokenParams, EmailPurpose } from "../../interface/dto/auth-verification.dto";
import { CommandBus } from "@nestjs/cqrs";
import { ConfigService } from "@nestjs/config";
import { CreateOneTimeTokenCommand } from "../command/create-one-time-token.command";
import { SendEmailVerificationCommand } from "../command/send-email-verification.command";
import { TokenFactory } from "./token.factory";

@Injectable()
export class AuthVerificationService {
  constructor(
    private readonly tokenFactory: TokenFactory,
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  async issueEmailToken(params: IssueEmailTokenParams) {
    const { raw, tokenHash, expiresAt } = this.tokenFactory.generate(EmailPurpose.REGISTER);
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
      EmailPurpose.REGISTER,
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
}
