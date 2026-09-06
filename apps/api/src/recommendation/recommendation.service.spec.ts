import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendation.service';
import { DATABASE } from '../db/database.constants';
import { CacheService } from '../redis/cache.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: DATABASE, useValue: {} },
        { provide: CacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
