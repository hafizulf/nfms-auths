import { CreateOneTimeTokenHandler } from "./create-one-time-token.handler";
import { CreateTokenHandler } from "./create-token.handler";
import { FindByHashAndPurposeHandler } from "./find-by-hash-and-purpose.handler";
import { FindByUserIdAndPurposeHandler } from "./find-by-userId-and-purpose.handler";
import { RevokeTokenHandler } from "./revoke-token.handler";
import { SendEmailVerificationHandler } from "./send-email-verification.handler";
import { UpdateUsedAtOneTimeTokenHandler } from "./update-used-at-one-time-token.handler";

export const AuthHandlers = [
  CreateTokenHandler,
  RevokeTokenHandler,
  CreateOneTimeTokenHandler,
  SendEmailVerificationHandler,
  FindByHashAndPurposeHandler,
  UpdateUsedAtOneTimeTokenHandler,
  FindByUserIdAndPurposeHandler,
];
