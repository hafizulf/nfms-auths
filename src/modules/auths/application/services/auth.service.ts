import { RegisterUserResponse, VerifyCredentialsResponse } from "src/modules/users-grpc/users.dto";
import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { LoginRequest, LoginTokenResponse, RegisterRequest, RegisterResponse, ResendTokenVerificationRequest, VerifyTokenRequest } from "../../interface/dto/auth.dto";
import { JWTService } from "src/modules/common/jwt/jwt.service";
import { uuidv7 } from "uuidv7";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateTokenCommand } from "../command/create-token.command";
import { RevokeTokenCommand } from "../command/revoke-token.command";
import { UserGrpcService } from "src/modules/users-grpc/users-grpc.service";
import { AuthVerificationService } from "./auth-verification.service";
import { EmailPurpose, ResendVerificationType } from "../../interface/dto/auth-verification.dto";
import { BadRequestException } from "../exceptions/auth.exception";
import { FindByUserIdAndPurposeQuery } from "../query/find-by-userId-and-purpose.query";

interface UsersServiceClient {
  VerifyCredentials(data: { email: string; password: string }): Observable<VerifyCredentialsResponse>;
  RegisterUser(data: RegisterRequest): Observable<RegisterUserResponse>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly _jwtService: JWTService,
    private readonly _commandBus: CommandBus,
    private readonly _queryBus: QueryBus,
    private readonly userGrpcService: UserGrpcService,
    private readonly _authVerificationService: AuthVerificationService,
  ) {}

  async login(
    body: LoginRequest,
  ): Promise<LoginTokenResponse> {
    const data = await this.userGrpcService.VerifyCredentials(body);
    const userData = data.user;
    const { token: accessToken, expiresAt: accessExp } =  this._jwtService.signAccess({ sub: userData.sub });
    const { token: refreshToken, expiresAt: refreshExp } = this._jwtService.signRefresh({ sub: userData.sub });
    const payload = {
      id: uuidv7(),
      user_id: userData.sub,
      token: refreshToken,
      is_revoked: false,
    }

    await this._commandBus.execute(new CreateTokenCommand(payload));

    return {
      accessToken,
      accessTokenExpiresAt: accessExp,
      refreshToken,
      refreshTokenExpiresAt: refreshExp,
    };
  }

  async logout(
    refreshToken: string,
  ): Promise<void> {
    await this._commandBus.execute(new RevokeTokenCommand(refreshToken));
  }

  async register(
    body: RegisterRequest,
  ): Promise<RegisterResponse> {
    const data = await this.userGrpcService.RegisterUser(body);
    const user = data.user;
    const payload = {
      user_id: user.id,
      email: user.email,
      purpose: EmailPurpose.REGISTER,
    }

    await this._authVerificationService.issueEmailToken(payload);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }

  async verifyEmail(
    body: VerifyTokenRequest,
  ): Promise<void> {
    const tokenUpdated = await this._authVerificationService.verifyToken(body);

    await this.userGrpcService.MarkEmailAsVerified(tokenUpdated.user_id);
  }

  async resendVerification(
    body: ResendTokenVerificationRequest,
  ): Promise<void> {
    const data = await this.userGrpcService.FindUserByEmail(body.email);
    const user = data.user;
    const ott = await this._queryBus.execute(
      new FindByUserIdAndPurposeQuery(user.id, EmailPurpose.REGISTER)
    );

    if(ott?.used_at !== null && user.is_email_verified) throw new BadRequestException('Email already verified');
    if(ott?.expires_at >= new Date()) throw new BadRequestException('Verification already sent');

    switch(body.type) {
      case ResendVerificationType.EMAIL:
        const payload = {
          user_id: user.id,
          email: user.email,
          purpose: body.purpose,
        }
        await this._authVerificationService.issueEmailToken(payload);
        break;
    }
  }
}
