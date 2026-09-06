import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dasboard.service';
import { UsersService } from '../users/users.service';
import { RecommendationsService } from '../recommendation/recommendation.service';
import { DATABASE } from '../db/database.constants';
import { CacheService } from '../redis/cache.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: UsersService, useValue: {} },
        { provide: RecommendationsService, useValue: {} },
        { provide: DATABASE, useValue: {} },
        { provide: CacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
