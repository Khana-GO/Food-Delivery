import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from './restaurant.service';
import { DATABASE } from '../db/database.constants';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { CacheService } from '../redis/cache.service';
import { NotificationsService } from '../notification/notification.service';

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: DATABASE, useValue: {} },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn(), deleteImage: jest.fn() } },
        { provide: CacheService, useValue: { wrap: jest.fn((k, ttl, fn) => fn()), del: jest.fn(), delByPattern: jest.fn(), hashOptions: jest.fn(() => 'hash') } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue({}), createMany: jest.fn().mockResolvedValue([]), notifyAdmins: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
