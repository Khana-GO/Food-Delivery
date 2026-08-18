import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('users/:userId/profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Param('userId', new ParseUUIDPipe()) userId: string,

    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.uploadUserProfileImage(file, userId);
  }

  @Post('restaurants/:restaurantId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRestaurantImage(
    @Param('restaurantId', new ParseUUIDPipe())
    restaurantId: string,

    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.uploadRestaurantImage(file, restaurantId);
  }

  @Post('menu-items/:menuItemId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMenuItemImage(
    @Param('menuItemId', new ParseUUIDPipe())
    menuItemId: string,

    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.uploadMenuItemImage(file, menuItemId);
  }

  @Delete(':publicId')
  async deleteImage(@Param('publicId') publicId: string) {
    return this.mediaService.deleteImage(publicId);
  }
}
