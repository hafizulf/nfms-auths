import { RegisterUserResponse, VerifyCredentialsResponse } from "src/modules/users-grpc/users.dto";
import {Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom, Observable } from "rxjs";
import { LoginRequest, LoginTokenResponse, RegisterRequest, RegisterResponse } from "../../interface/dto/auth.dto";
import { ServiceError, status } from "@grpc/grpc-js";
import { 
  BadGatewayException, 
  ConflictException, 
  GatewayTimeoutException, 
  InvalidCredentialsException, 
  ServiceUnavailableException 
} from "../exceptions/auth.exception";
import { JWTService } from "src/modules/common/jwt/jwt.service";
import { uuidv7 } from "uuidv7";
import { CommandBus } from "@nestjs/cqrs";
import { CreateTokenCommand } from "../command/create-token.command";
import { RevokeTokenCommand } from "../command/revoke-token.command";

interface UsersServiceClient {
  VerifyCredentials(data: { email: string; password: string }): Observable<VerifyCredentialsResponse>;
  RegisterUser(data: RegisterRequest): Observable<RegisterUserResponse>;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private users!: UsersServiceClient;

  constructor(
    @Inject('USERS_GRPC') private readonly _client: ClientGrpc,
    private readonly _jwtService: JWTService,
    private readonly _commandBus: CommandBus,
  ) {}

  onModuleInit() {
    this.users = this._client.getService<UsersServiceClient>('UserService');  
  }

  async login(
    body: LoginRequest,
  ): Promise<LoginTokenResponse> {
  try {
      const data = await firstValueFrom(
        this.users.VerifyCredentials(body)
      );
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
    } catch (err) {
      this.mapGrpcToHttp(err as ServiceError);
    }
  }

  async logout(
    refreshToken: string,
  ): Promise<void> {
    await this._commandBus.execute(new RevokeTokenCommand(refreshToken));
  }

  async register(
    body: RegisterRequest,
  ): Promise<RegisterResponse> {
    try {
      const data = await firstValueFrom(
        this.users.RegisterUser(body)
      )

      const user = data.user;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    } catch (err) {
      this.mapGrpcToHttp(err as ServiceError);
    }
  }

  private mapGrpcToHttp(err: ServiceError): never {
    switch (err.code) {
      case status.ALREADY_EXISTS:
        throw new ConflictException(err.details);
      case status.NOT_FOUND:
      case status.UNAUTHENTICATED:
        throw new InvalidCredentialsException();

      case status.UNAVAILABLE:
        throw new ServiceUnavailableException('Users');

      case status.DEADLINE_EXCEEDED:
        throw new GatewayTimeoutException('Users');

      default:
        throw new BadGatewayException();
    }
  }
}
