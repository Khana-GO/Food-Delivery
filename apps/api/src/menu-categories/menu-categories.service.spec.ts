import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './menu-categories.service';
import { DATABASE } from '../db/database.constants';
import { NotificationsService } from '../notification/notification.service';
import { CacheService } from '../redis/cache.service';

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: DATABASE, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: CacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
