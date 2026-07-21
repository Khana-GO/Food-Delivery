import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createReviewDto: any, @Request() req: any) {
    return this.reviewsService.create(createReviewDto, req.user.userId);
  }

  @Get('restaurant/:restaurantId')
  findAllForRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.reviewsService.findAllForRestaurant(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: any, @Request() req: any) {
    return this.reviewsService.update(id, req.user.userId, updateReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.remove(id, req.user.userId);
  }
}
