export enum EmailPurpose {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export class IssueEmailTokenParams {
  user_id: string;
  email: string;
  purpose: EmailPurpose;
}

export class CreateOneTimeToken {
  user_id: string;
  purpose: EmailPurpose;
  token_hash: Buffer;
  expires_at: Date;
}

export class SendEmailVerificationPayload {
  email: string;
  purpose: EmailPurpose;
  verifyUrl: string;
  expiresAt: string;
}
