import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('protected')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('protected')
export class ProtectedController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  getMe(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Authenticated successfully',
      user,
    };
  }
}
