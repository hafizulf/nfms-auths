import { RegisterUserResponse, VerifyCredentialsResponse } from "src/modules/users-grpc/users.dto";
import {Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { LoginRequest, LoginTokenResponse, RegisterRequest, RegisterResponse } from "../../interface/dto/auth.dto";
import { JWTService } from "src/modules/common/jwt/jwt.service";
import { uuidv7 } from "uuidv7";
import { CommandBus } from "@nestjs/cqrs";
import { CreateTokenCommand } from "../command/create-token.command";
import { RevokeTokenCommand } from "../command/revoke-token.command";
import { GrpcClientHelper } from "src/helpers/grpc-client.helper";

interface UsersServiceClient {
  VerifyCredentials(data: { email: string; password: string }): Observable<VerifyCredentialsResponse>;
  RegisterUser(data: RegisterRequest): Observable<RegisterUserResponse>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private users!: UsersServiceClient;
  private userService: string = 'Users Service';

  constructor(
    @Inject('USERS_GRPC') private readonly _client: ClientGrpc,
    private readonly _jwtService: JWTService,
    private readonly _commandBus: CommandBus,
    private readonly grpc: GrpcClientHelper,
  ) {}

  onModuleInit() {
    this.users = this._client.getService<UsersServiceClient>('UserService');  
  }

  async login(
    body: LoginRequest,
  ): Promise<LoginTokenResponse> {
    const data = await this.grpc.call<VerifyCredentialsResponse>(this.userService, this.users.VerifyCredentials(body));
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
    const data = await this.grpc.call<RegisterUserResponse>(this.userService, this.users.RegisterUser(body));
    const user = data.user;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }
}
