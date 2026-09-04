import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Promotions')
@ApiBearerAuth()
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ─── CREATE PROMOTION (Admin only) ───
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new promotion' })
  async create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  // ─── VALIDATE PROMOTION (Customer) ───
  @Post('validate')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Validate a promotion code' })
  async validate(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ValidatePromotionDto,
  ) {
    return this.promotionsService.validatePromotion(dto, user.sub);
  }

  // ─── GET ALL PROMOTIONS (Admin) ───
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all promotions' })
  async getAll() {
    return this.promotionsService.getAllPromotions();
  }

  // ─── DELETE PROMOTION (Admin) ───
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a promotion' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.promotionsService.deletePromotion(id);
  }
}
