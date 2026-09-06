import { Test, TestingModule } from '@nestjs/testing';
import { AddressesService } from './addresses.service';
import { DATABASE } from '../db/database.constants';

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddressesService, { provide: DATABASE, useValue: {} }],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
