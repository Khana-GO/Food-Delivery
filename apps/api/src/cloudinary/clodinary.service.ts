import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');

    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');

    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary environment variables are not configured');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{
    url: string;
    publicId: string;
  }> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              {
                width: 500,
                height: 500,
                crop: 'fill',
                gravity: 'face',
              },
            ],
          },
          (error, result) => {
            if (error) {
              reject(
                new InternalServerErrorException('Failed to upload image'),
              );
              return;
            }

            if (!result) {
              reject(
                new InternalServerErrorException(
                  'Cloudinary returned no result',
                ),
              );
              return;
            }

            resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      this.logger.error('Cloudinary upload failed', error);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to delete Cloudinary image: ${publicId}`,
        error,
      );

      throw new InternalServerErrorException('Failed to delete image');
    }
  }
}
