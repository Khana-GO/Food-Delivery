import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { HealthCheckResponse} from '@food_delivery/types'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')  // /api/health
  health(): HealthCheckResponse {
    console.log('Health check endpoint called');
    return {
      status: 'ok',
      timestamp: new Date(),
    }
  }
}
