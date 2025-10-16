import { EmailPurpose } from "../../interface/dto/auth-verification.dto";

export const EMAIL_ROUTING: Record<EmailPurpose, string> = {
  REGISTER: 'mailer.send.register',
  FORGOT_PASSWORD: 'mailer.send.reset',
} as const;

export const EMAIL_EXCHANGE = 'auth.events';
