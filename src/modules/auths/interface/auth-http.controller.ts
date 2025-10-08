import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { LoginRequest } from "./dto/auth.dto";
import { AuthService } from "../application/services/auth.service";

@Controller()
export class AuthHttpController {
  constructor(
    private readonly _authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() request: LoginRequest,
  ): Promise<void> {
    // kenapa sukses tapi gabisa nangkep respon user?? padahal di user service ada return nya
    const res = await this._authService.login(request);
    console.log("res", res);
  }
}
