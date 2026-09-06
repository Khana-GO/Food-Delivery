import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { DATABASE } from '../db/database.constants';
import { CacheService } from '../redis/cache.service';
import { ConfigService } from '@nestjs/config';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: DATABASE, useValue: {} },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            wrap: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
