import { Inject, Injectable } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { firstValueFrom, Observable } from "rxjs";
import { LoginRequest } from "../../interface/dto/auth.dto";

interface UsersServiceClient {
  FindUserByEmail(data: { email: string }): Observable<{ user?: any }>;
}

@Injectable()
export class AuthService {
  private users!: UsersServiceClient;

  constructor(@Inject('USERS_GRPC') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.users = this.client.getService<UsersServiceClient>('UserService');
  }

  async login(
    body: LoginRequest,
  ): Promise<void> {
    const isEmailExist = await firstValueFrom(this.users.FindUserByEmail({ email: body.email }));
    console.log("isEmailExist", isEmailExist);
  }
}