import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return a healthy status payload', () => {
      const result = appController.health();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(Date),
      });
    });
  });
});