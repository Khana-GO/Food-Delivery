import { Test, TestingModule } from '@nestjs/testing';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';

describe('ExportController', () => {
  let controller: ExportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExportController],
      providers: [ExportService],
    }).compile();

    controller = module.get<ExportController>(ExportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
