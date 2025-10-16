import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { RabbitMQPublisher } from "./rabbitmq.publisher";
import { EMAIL_EXCHANGE } from "./email-routing";

@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get('RABBITMQ_URI'),
        exchanges: [{ name: EMAIL_EXCHANGE, type: 'topic' }],
        connectionInitOptions: { wait: true, timeout: 10_000 },
      }),
    }),
  ],
  providers: [RabbitMQPublisher],
  exports: [RabbitMQPublisher],
})
export class RabbitMQInfraModule {}
