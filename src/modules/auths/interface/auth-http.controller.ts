import { Body, Controller, Post } from "@nestjs/common";
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
    await this._authService.login(request);
  }
}
