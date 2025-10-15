import { IsNotEmpty, IsEmail } from "class-validator";

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
