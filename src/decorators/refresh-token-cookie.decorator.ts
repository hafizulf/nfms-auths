import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { BadRequestException } from 'src/modules/auths/application/exceptions/auth.exception';
import { RefreshTokenConst } from 'src/modules/common/const/token.const';

export const RefreshTokenCookie = createParamDecorator((required: boolean, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const token = req.cookies?.[RefreshTokenConst.COOKIE_ID];
  if (required && !token) {
    throw new BadRequestException('Refresh token is required');
  }
  return token ?? null;
});
