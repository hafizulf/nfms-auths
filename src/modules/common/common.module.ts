import { Module } from "@nestjs/common";
import { GrpcClientHelper } from "src/helpers/grpc-client.helper";

@Module({
  providers: [GrpcClientHelper],
  exports: [GrpcClientHelper],
})
export class CommonModule {}
