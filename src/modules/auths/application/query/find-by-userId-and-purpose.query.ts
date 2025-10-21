import { VerifyTokenRequest } from "../../interface/dto/auth.dto";

export class FindByUserIdAndPurposeQuery {
  constructor(
    public readonly user_id: string,
    public readonly purpose: VerifyTokenRequest['purpose'],
  ) {}
}
