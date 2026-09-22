import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesService } from './invoices.service';
import { DATABASE } from '../db/database.constants';
import { CacheService } from '../redis/cache.service';

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: DATABASE, useValue: {} },
        { provide: CacheService, useValue: {} },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
