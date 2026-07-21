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
    const latitude = lat ? parseFloat(lat) : null;
    const longitude = lng ? parseFloat(lng) : null;

    return this.homeService.getHomeData(latitude, longitude);
  }
}
