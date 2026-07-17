import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@ApiTags('protected')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('protected')
export class ProtectedController {
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  @Roles('CUSTOMER', 'ADMIN')
  getMe(@CurrentUser() user: JwtPayload) {
    return {
      message: 'Authenticated successfully',
      user,
    };
  }
}
