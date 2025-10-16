import { CreateOneTimeTokenHandler } from "./create-one-time-token.handler";
import { CreateTokenHandler } from "./create-token.handler";
import { RevokeTokenHandler } from "./revoke-token.handler";
import { SendEmailVerificationHandler } from "./send-email-verification.handler";

export const AuthHandlers = [
  CreateTokenHandler,
  RevokeTokenHandler,
  CreateOneTimeTokenHandler,
  SendEmailVerificationHandler,
];
