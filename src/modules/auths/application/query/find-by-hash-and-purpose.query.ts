import { VerifyTokenRequest } from "../../interface/dto/auth.dto";

export class FindByHashAndPurposeQuery {
  constructor(
    public readonly tokenHashed: Buffer,
    public readonly purpose: VerifyTokenRequest['purpose'],
  ) {}
}
