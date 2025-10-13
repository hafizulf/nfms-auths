import { Body, Controller, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { LoginRequest, LoginTokenResponse } from "./dto/auth.dto";
import { AuthService } from "../application/services/auth.service";
import type { FastifyReply } from "fastify";
import { StandardResponseDto } from "src/modules/common/dto/standard-response.dto";

@Controller()
export class AuthHttpController {
  constructor(
    private readonly _authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<StandardResponseDto<
    Omit<LoginTokenResponse, 'refreshToken' | 'refreshTokenExpiresAt'>>
  > {
    const result = await this._authService.login(request);
    const { accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt } = result;

    // set cookie refresh token
    const nowSec = Math.floor(Date.now() / 1000);
    const maxAgeSec = Math.max(0, refreshTokenExpiresAt - nowSec);
    res.setCookie('rtid', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSec,
    });

    return {
      statusCode: 200,
      message: 'success',
      data: {
        accessToken,
        accessTokenExpiresAt,
      }
    }
  }
}
