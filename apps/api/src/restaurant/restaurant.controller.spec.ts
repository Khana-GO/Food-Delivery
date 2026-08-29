import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from './restaurant.controller';
import { RestaurantsService } from './restaurant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DATABASE } from '../db/database.constants';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { CacheService } from '../redis/cache.service';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        RestaurantsService,
        { provide: DATABASE, useValue: {} },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn(), deleteImage: jest.fn() } },
        { provide: CacheService, useValue: { wrap: jest.fn((k, ttl, fn) => fn()), del: jest.fn(), delByPattern: jest.fn(), hashOptions: jest.fn(() => 'hash') } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
