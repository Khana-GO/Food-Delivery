import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsService } from './menu.service';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { DATABASE } from '../db/database.constants';
import { NotificationsService } from '../notification/notification.service';
import { CacheService } from '../redis/cache.service';

describe('MenuItemsService', () => {
  let service: MenuItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        {
          provide: DATABASE,
          useValue: {},
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            createMany: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            delByPattern: jest.fn(),
            wrap: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
