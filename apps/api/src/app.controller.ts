import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthCheckResponse } from '@food_delivery/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Liveness/readiness probe used by the container healthcheck.
   *
   * Previously this returned 30 hardcoded demo menu rows as its payload, which
   * made the endpoint meaningless (and misleading) as a health signal.
   */
  @Get('health')
  health(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}
