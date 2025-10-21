import { IsEmail, IsUUID } from "class-validator";

export class Sub {
  sub: string
}

export class VerifyCredentialsResponse {
  user: Sub;
}

class User {
  id: string;
  name: string;
  email: string;
  is_email_verified: boolean;
}

export class RegisterUserResponse {
  user: User;
}

export class MarkEmailAsVerifiedRequest {
  @IsUUID('7', { message: "Id must be a valid uuid" })
  user_id!: string;
}

export class MarkEmailAsVerifiedResponse {
  user: User;
}

export class FindUserByEmailRequest {
  @IsEmail()
  email: string;
}

export class FindUserByEmailResponse {
  user: User;
}
