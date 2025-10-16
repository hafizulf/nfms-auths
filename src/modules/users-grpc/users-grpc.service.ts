import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { GrpcClientHelper } from "src/helpers/grpc-client.helper";
import { RegisterUserResponse, VerifyCredentialsResponse } from "./users.dto";
import { LoginRequest, RegisterRequest } from "../auths/interface/dto/auth.dto";
import { Observable } from "rxjs";

interface UsersServiceClient {
  VerifyCredentials(data: LoginRequest): Observable<VerifyCredentialsResponse>;
  RegisterUser(data: RegisterRequest): Observable<RegisterUserResponse>;
}

@Injectable()
export class UserGrpcService implements OnModuleInit {
  private users!: UsersServiceClient;
  private userServiceName: string = 'Users Service';

  constructor(
    @Inject('USERS_GRPC') private readonly _client: ClientGrpc,
    private readonly grpc: GrpcClientHelper,
  ) {}

  onModuleInit() {
    this.users = this._client.getService<UsersServiceClient>('UserService');  
  }

  async VerifyCredentials(data: LoginRequest): Promise<VerifyCredentialsResponse> {
    return await this.grpc.call<VerifyCredentialsResponse>(this.userServiceName, this.users.VerifyCredentials(data));
  }

  async RegisterUser(data: RegisterRequest): Promise<RegisterUserResponse> {
    return await this.grpc.call<RegisterUserResponse>(this.userServiceName, this.users.RegisterUser(data));
  }
}
