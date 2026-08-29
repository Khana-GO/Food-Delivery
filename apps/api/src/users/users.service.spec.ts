import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DATABASE } from '../db/database.constants';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notification/notification.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DATABASE, useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: CloudinaryService, useValue: { uploadImage: jest.fn(), deleteImage: jest.fn() } },
        { provide: NotificationsService, useValue: { create: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
