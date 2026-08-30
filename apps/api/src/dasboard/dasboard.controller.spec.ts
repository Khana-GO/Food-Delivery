import { Test, TestingModule } from '@nestjs/testing';
import { DasboardController } from './dasboard.controller';
import { DasboardService } from './dasboard.service';

describe('DasboardController', () => {
  let controller: DasboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DasboardController],
      providers: [DasboardService],
    }).compile();

    controller = module.get<DasboardController>(DasboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
