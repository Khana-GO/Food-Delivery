import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './review.service';
import { DATABASE } from '../db/database.constants';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReviewsService, { provide: DATABASE, useValue: {} }],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
