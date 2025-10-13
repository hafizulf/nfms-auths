import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: any, res: any, next: () => void): void {
    const method = req.method;
    const url = req.originalUrl ?? req.url; // express || fastify
    const start = Date.now();
    const rawRes = res?.raw ?? res;

    if (!rawRes || typeof rawRes.once !== 'function') {
      next();
      return;
    }

    rawRes.once('finish', () => {
      const statusCode = rawRes.statusCode;
      const responseTime = Date.now() - start;
      this.logger.log(`${method} ${url} ${statusCode} ${responseTime}ms`);
    });

    next();
  }
}
