import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { ClientGrpc } from "@nestjs/microservices";
import { GrpcClientHelper } from "src/helpers/grpc-client.helper";
import { RegisterUserResponse, VerifyCredentialsResponse, MarkEmailAsVerifiedResponse, MarkEmailAsVerifiedRequest, FindUserByEmailRequest, FindUserByEmailResponse } from "./users.dto";
import { LoginRequest, RegisterRequest, ResetPasswordRequest } from "../auths/interface/dto/auth.dto";
import { Observable } from "rxjs";

interface UsersServiceClient {
  VerifyCredentials(data: LoginRequest): Observable<VerifyCredentialsResponse>;
  RegisterUser(data: RegisterRequest): Observable<RegisterUserResponse>;
  MarkEmailAsVerified(data: MarkEmailAsVerifiedRequest): Observable<MarkEmailAsVerifiedResponse>;
  FindUserByEmail(data: FindUserByEmailRequest): Observable<FindUserByEmailResponse>;
  ResetPassword(data: { user_id: string; password: string }): Observable<FindUserByEmailResponse>;
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

  async MarkEmailAsVerified(user_id: string): Promise<MarkEmailAsVerifiedResponse> {
    return await this.grpc.call<MarkEmailAsVerifiedResponse>(this.userServiceName, this.users.MarkEmailAsVerified({ user_id }));
  }

  async FindUserByEmail(email: string): Promise<FindUserByEmailResponse> {
    return await this.grpc.call<FindUserByEmailResponse>(this.userServiceName, this.users.FindUserByEmail({ email }));
  }

  async ResetPassword(data: { user_id: string; password: string }): Promise<FindUserByEmailResponse> {
    return await this.grpc.call<FindUserByEmailResponse>(this.userServiceName, this.users.ResetPassword(data));
  }
}
