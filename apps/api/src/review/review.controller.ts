import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewStatsDto } from './dto/review-stats.dto';
import { ReviewPaginationDto } from './dto/review-pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ReviewsService } from './review.service';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── CREATE REVIEW ───
  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a review' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(user.sub, dto);
  }

  // ─── GET REVIEWS FOR RESTAURANT ───
  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get reviews for a restaurant' })
  async getReviewsForRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Query() pagination: ReviewPaginationDto,
  ) {
    return this.reviewsService.getReviewsForRestaurant(
      restaurantId,
      pagination,
    );
  }

  // ─── GET REVIEW STATS ───
  @Get('restaurant/:restaurantId/stats')
  @ApiOperation({ summary: 'Get review statistics for a restaurant' })
  async getReviewStats(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
  ): Promise<ReviewStatsDto> {
    return this.reviewsService.getReviewStats(restaurantId);
  }

  // ─── GET MY REVIEWS (CUSTOMER) ───
  @Get('my')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get my reviews and average rating' })
  async getMyReviews(@CurrentUser() user: JwtPayload) {
    return this.reviewsService.getMyReviews(user.sub);
  }

  // ─── UPDATE REVIEW ───
  @Put(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Update your review' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.updateReview(id, user.sub, dto);
  }

  // ─── DELETE REVIEW ───
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a review' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.reviewsService.deleteReview(id, user.sub, user.role!);
  }

  // ─── ADMIN: GET ALL REVIEWS ───
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin: Get all reviews' })
  async adminGetAllReviews(@Query() pagination: ReviewPaginationDto) {
    return this.reviewsService.adminGetAllReviews(pagination);
  }
}
