import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Global exception filter.
 *
 * Gives every unhandled error one consistent JSON shape, logs it once with the
 * request context (so failures are traceable), and never leaks an internal
 * message or stack trace to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload = isHttpException
      ? exception.getResponse()
      : { statusCode: status, message: 'Internal server error' };

    const body =
      typeof payload === 'string'
        ? { statusCode: status, message: payload }
        : (payload as Record<string, unknown>);

    const method = request?.method ?? 'UNKNOWN';
    const url = request?.originalUrl ?? request?.url ?? '';
    const detail =
      exception instanceof Error ? exception.message : String(exception);

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${method} ${url} -> ${status} ${detail}`, stack);
    } else {
      this.logger.warn(`${method} ${url} -> ${status} ${detail}`);
    }

    if (response.headersSent) return;

    response.status(status).json({
      statusCode: status,
      ...body,
      path: url,
      timestamp: new Date().toISOString(),
    });
  }
}
