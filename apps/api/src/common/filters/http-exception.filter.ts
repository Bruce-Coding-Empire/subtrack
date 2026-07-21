import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response
        .status(exception.getStatus())
        .json({ success: false, error: this.extractMessage(exception) });
      return;
    }

    this.logger.error(
      'Unhandled exception',
      exception instanceof Error ? exception.stack : exception,
    );
    response
      .status(500)
      .json({ success: false, error: 'Internal server error' });
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') return body;

    // Nest's ExceptionResponse type is `string | object` — this shape (message as
    // string or string[]) is what ValidationPipe and built-in HttpException subtypes
    // actually produce, so narrowing via a local type is the only clean option here.
    const { message } = body as { message?: string | string[] };
    if (Array.isArray(message)) return message[0];
    if (typeof message === 'string') return message;
    return 'An error occurred';
  }
}
