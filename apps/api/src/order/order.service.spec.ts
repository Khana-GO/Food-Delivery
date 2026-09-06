import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './order.service';
import { DATABASE } from '../db/database.constants';
import { CacheService } from '../redis/cache.service';
import { NotificationsService } from '../notification/notification.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: DATABASE, useValue: {} },
        { provide: CacheService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
