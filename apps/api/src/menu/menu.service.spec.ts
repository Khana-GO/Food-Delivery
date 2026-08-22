import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsService } from './menu.service';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { DATABASE } from '../db/database.constants';

describe('MenuItemsService', () => {
  let service: MenuItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        {
          provide: DATABASE,
          useValue: {},
        },
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuItemsService>(MenuItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
