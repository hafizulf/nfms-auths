import { IsNotEmpty, IsEmail } from "class-validator";

export class LoginRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
