import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RabbitMQPublisher {
  constructor(private readonly amqp: AmqpConnection) {}

  async publishJson(
    exchange: string,
    routingKey: string,
    payload: unknown,
    headers?: Record<string, any>,
  ): Promise<void> {
    await this.amqp.publish(
      exchange,
      routingKey,
      payload,
      {
        contentType: 'application/json',
        deliveryMode: 2,           // persistent
        headers: headers ?? {},    // idempotency-key, purpose, etc.
      },
    );
  }
}
