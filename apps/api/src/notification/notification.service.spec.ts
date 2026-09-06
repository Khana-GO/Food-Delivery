import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notification.service';
import { DATABASE } from '../db/database.constants';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService, { provide: DATABASE, useValue: {} }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
