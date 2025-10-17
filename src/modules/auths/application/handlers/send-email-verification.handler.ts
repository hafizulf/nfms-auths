import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SendEmailVerificationCommand } from "../command/send-email-verification.command";
import { RabbitMQPublisher } from "../../infrastructure/rabbitmq/rabbitmq.publisher";
import { EMAIL_EXCHANGE, EMAIL_ROUTING } from "../../infrastructure/rabbitmq/email-routing";
import { SendEmailVerificationPayload } from "../../interface/dto/auth-verification.dto";

@CommandHandler(SendEmailVerificationCommand)
export class SendEmailVerificationHandler 
implements ICommandHandler<SendEmailVerificationCommand, void> {
  constructor(
    private readonly publisher: RabbitMQPublisher,
  ) {}
  
  async execute(command: SendEmailVerificationCommand): Promise<void> {
    const { email, purpose, expiresAt, verifyUrl } = command.payload;
    const message: SendEmailVerificationPayload = {
      email: email,
      purpose: purpose,
      verifyUrl: verifyUrl,
      expiresAt: expiresAt,
    }

    const headers = {
      'x-email-id': email,
      'x-purpose': purpose,
      'x-idempotency-key': `${purpose}:${email}:${expiresAt}`,
    };

    await this.publisher.publishJson(
      EMAIL_EXCHANGE,
      EMAIL_ROUTING[purpose],
      message,
      headers,
    )
  }
}
