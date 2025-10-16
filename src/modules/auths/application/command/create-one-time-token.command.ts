import { CreateOneTimeToken } from "../../interface/dto/auth-verification.dto";

export class CreateOneTimeTokenCommand {
  constructor(
    public readonly payload: CreateOneTimeToken,
  ) {}
}
