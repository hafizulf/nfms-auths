import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseFilters } from "@nestjs/common";
import { LoginRequest, LoginTokenResponse, RegisterRequest, RegisterResponse } from "./dto/auth.dto";
import { AuthService } from "../application/services/auth.service";
import type { FastifyReply } from "fastify";
import { StandardResponseDto } from "src/modules/common/dto/standard-response.dto";
import { RefreshTokenConst } from "src/modules/common/const/token.const";
import { RefreshTokenCookie } from "src/decorators/refresh-token-cookie.decorator";
import { GrpcToHttpFilter } from "src/filters/grpc-to-http.filter";

@Controller()
@UseFilters(GrpcToHttpFilter)
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
    res.setCookie(RefreshTokenConst.COOKIE_ID, refreshToken, {
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

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @RefreshTokenCookie(true) refreshToken: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<void> {
    await this._authService.logout(refreshToken);

    res.clearCookie(RefreshTokenConst.COOKIE_ID, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterRequest,
  ): Promise<StandardResponseDto<RegisterResponse>> {
    const registeredUser = await this._authService.register(request);

    return {
      statusCode: 201,
      message: 'success',
      data: registeredUser,
    }
  }
}
