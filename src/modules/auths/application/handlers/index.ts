import { CreateTokenHandler } from "./create-token.handler";
import { RevokeTokenHandler } from "./revoke-token.handler";

export const AuthHandlers = [
  CreateTokenHandler,
  RevokeTokenHandler,
];
