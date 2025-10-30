import { FindUserByEmailResponse } from "src/modules/users-grpc/users.dto";
import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { GenerateAccessTokenResponse, LoginRequest, LoginTokenResponse, RegisterRequest, RegisterResponse, ResendTokenVerificationRequest, ResetPasswordRequest, VerifyTokenRequest } from "../../interface/dto/auth.dto";
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
import { OneTimeTokenEntity } from "../../infrastructure/persistence/entities/one-time-token.entity";
import { FindByTokenQuery } from "../query/find-by-token.query";

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
  ): Promise<OneTimeTokenEntity> {
    const verifiedRec = await this._authVerificationService.verifyToken(body);

    if(body.purpose === EmailPurpose.REGISTER) {
      await this.userGrpcService.MarkEmailAsVerified(verifiedRec.user_id);
    }

    return verifiedRec;
  }

  async sendTokenVerification(
    body: ResendTokenVerificationRequest,
  ): Promise<void> {
    const { type, purpose } = body;
    const data = await this.userGrpcService.FindUserByEmail(body.email);
    const user = data.user;
    const ott = await this._queryBus.execute(
      new FindByUserIdAndPurposeQuery(user.id, purpose)
    );

    if(purpose === EmailPurpose.REGISTER) {
      if(ott?.used_at !== null && user.is_email_verified) throw new BadRequestException('Email already verified');
    } else if(purpose === EmailPurpose.FORGOT_PASSWORD) {
      if(!user.is_email_verified) throw new BadRequestException('Email not verified');
    }
    if(ott?.expires_at >= new Date()) throw new BadRequestException('Verification already sent');

    switch(type) {
      case ResendVerificationType.EMAIL:
        const payload = {
          user_id: user.id,
          email: user.email,
          purpose: purpose,
        }
        await this._authVerificationService.issueEmailToken(payload);
        break;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const data = await this.userGrpcService.FindUserByEmail(email);
    const user = data.user;
    const payload = {
      user_id: user.id,
      email: user.email,
      purpose: EmailPurpose.FORGOT_PASSWORD,
    }
    await this._authVerificationService.issueEmailToken(payload);
  }

  async resetPassword(
    body: ResetPasswordRequest,
  ): Promise<FindUserByEmailResponse> {
    const { token, password } = body;
    const verifiedRec = await this.verifyEmail({
      token,
      purpose: EmailPurpose.FORGOT_PASSWORD,
    });

    const data = await this.userGrpcService.ResetPassword({ user_id: verifiedRec.user_id, password });
    return data;
  }

  async generateAccessToken(refreshToken: string): Promise<GenerateAccessTokenResponse> {
    const payload = await this._queryBus.execute(
      new FindByTokenQuery(refreshToken)
    );
    const { token: accessToken, expiresAt: accessExp } =  this._jwtService.signAccess({ sub: payload.user_id });

    return {
      accessToken,
      accessTokenExpiresAt: accessExp,
    };
  }
}
