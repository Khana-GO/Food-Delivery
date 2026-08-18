import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/clodinary.service';

@Injectable()
export class MediaService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadUserProfileImage(file: Express.Multer.File, userId: string) {
    const result = await this.cloudinaryService.uploadImage(
      file,
      `khanago/users/${userId}`,
    );

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  async uploadRestaurantImage(file: Express.Multer.File, restaurantId: string) {
    const result = await this.cloudinaryService.uploadImage(
      file,
      `khanago/restaurants/${restaurantId}`,
    );

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  async uploadMenuItemImage(file: Express.Multer.File, menuItemId: string) {
    const result = await this.cloudinaryService.uploadImage(
      file,
      `khanago/menu-items/${menuItemId}`,
    );

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  }

  async deleteImage(publicId: string) {
    await this.cloudinaryService.deleteImage(publicId);

    return {
      message: 'Image deleted successfully',
    };
  }
}
