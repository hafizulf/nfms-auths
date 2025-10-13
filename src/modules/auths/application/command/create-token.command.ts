import { CreateTokenPayload } from "../../interface/dto/auth.dto";

export class CreateTokenCommand {
  constructor(
    public readonly payload: CreateTokenPayload,
  ) {}
}
