import { Test, TestingModule } from '@nestjs/testing';
import { DasboardService } from './dasboard.service';

describe('DasboardService', () => {
  let service: DasboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DasboardService],
    }).compile();

    service = module.get<DasboardService>(DasboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
