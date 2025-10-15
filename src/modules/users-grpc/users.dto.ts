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
}

export class RegisterUserResponse {
  user: User;
}
