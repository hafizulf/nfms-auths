import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AppException } from 'src/modules/auths/application/exceptions/app.exception';

@Catch(AppException)
export class AppExceptionHttpFilter implements ExceptionFilter {
  catch(err: AppException, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status = err.httpStatus;
    
    reply.code(status).send({
      statusCode: status,
      code: err.code,
      message: err.message,
    });
  }
}
