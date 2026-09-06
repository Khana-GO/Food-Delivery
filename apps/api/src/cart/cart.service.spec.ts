import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { DATABASE } from '../db/database.constants';

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CartService, { provide: DATABASE, useValue: {} }],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
