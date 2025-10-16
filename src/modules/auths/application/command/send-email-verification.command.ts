import { SendEmailVerificationPayload } from "../../interface/dto/auth-verification.dto";

export class SendEmailVerificationCommand {
  constructor(
    public readonly payload: SendEmailVerificationPayload,
  ) {}
}
