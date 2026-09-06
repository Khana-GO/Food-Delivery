import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { KhanaGoAgent } from '../agents/khana-go.agent';
import { DATABASE } from '../db/database.constants';

describe('AIService', () => {
  let service: AIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: KhanaGoAgent,
          useValue: {},
        },
        {
          provide: DATABASE,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
