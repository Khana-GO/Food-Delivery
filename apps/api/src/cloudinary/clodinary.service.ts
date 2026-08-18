import { Multer } from 'multer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),

      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),

      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new InternalServerErrorException('File is required');
    }

    try {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,

            resource_type: 'image',

            transformation: [
              {
                width: 1200,
                height: 1200,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto',
              },
            ],
          },

          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload failed', error);

              return reject(error);
            }

            if (!result) {
              return reject(new Error('Cloudinary returned no result'));
            }

            resolve(result);
          },
        );

        Readable.from(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error('Failed to upload image to Cloudinary', error);

      throw new InternalServerErrorException('Image upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      this.logger.error(
        `Failed to delete Cloudinary image: ${publicId}`,
        error,
      );

      throw new InternalServerErrorException('Image deletion failed');
    }
  }
}
