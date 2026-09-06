import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from './export.service';
import { DATABASE } from '../db/database.constants';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportService, { provide: DATABASE, useValue: {} }],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
