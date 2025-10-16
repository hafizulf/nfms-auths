import { RegisterUserResponse, VerifyCredentialsResponse } from "src/modules/users-grpc/users.dto";
import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { LoginRequest, LoginTokenResponse, RegisterRequest, RegisterResponse } from "../../interface/dto/auth.dto";
import { JWTService } from "src/modules/common/jwt/jwt.service";
import { uuidv7 } from "uuidv7";
import { CommandBus } from "@nestjs/cqrs";
import { CreateTokenCommand } from "../command/create-token.command";
import { RevokeTokenCommand } from "../command/revoke-token.command";
import { UserGrpcService } from "src/modules/users-grpc/users-grpc.service";
import { AuthVerificationService } from "./auth-verification.service";
import { EmailPurpose } from "../../interface/dto/auth-verification.dto";

interface UsersServiceClient {
  VerifyCredentials(data: { email: string; password: string }): Observable<VerifyCredentialsResponse>;
  RegisterUser(data: RegisterRequest): Observable<RegisterUserResponse>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly _jwtService: JWTService,
    private readonly _commandBus: CommandBus,
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
}
