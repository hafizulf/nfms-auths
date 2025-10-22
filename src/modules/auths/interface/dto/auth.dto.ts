import { IsNotEmpty, IsEmail, IsString, IsEnum } from "class-validator";
import { EmailPurpose, ResendVerificationType } from "./auth-verification.dto";

export class LoginRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

export class CreateTokenPayload {
  id: string;
  user_id: string;
  token: string;
  is_revoked: boolean;
}

export class RegisterRequest {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class RegisterResponse {
  id: string;
  name: string;
  email: string;
}

export class VerifyTokenRequest {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsEnum(EmailPurpose)
  purpose!: EmailPurpose;
}

export class ResendTokenVerificationRequest {
  @IsNotEmpty()
  @IsEnum(ResendVerificationType)
  type!: ResendVerificationType;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsEnum(EmailPurpose)
  purpose!: EmailPurpose;
}

export class ForgotPasswordRequest {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordRequest {
  @IsNotEmpty()
  @IsString()
  token!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
