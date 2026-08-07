import { Controller, Get, Query } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async getHomeData(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    try {
      let latitude = lat && lat !== 'undefined' && lat !== 'null' ? parseFloat(lat) : null;
      if (latitude !== null && isNaN(latitude)) latitude = null;

      let longitude = lng && lng !== 'undefined' && lng !== 'null' ? parseFloat(lng) : null;
      if (longitude !== null && isNaN(longitude)) longitude = null;

      return await this.homeService.getHomeData(latitude, longitude);
    } catch (error: any) {
      return { statusCode: 500, message: error.message, stack: error.stack };
    }
  }
}
