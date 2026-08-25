import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsController } from './menu.controller';
import { MenuItemsService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('MenuItemsController', () => {
  let controller: MenuItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemsController],
      providers: [
        {
          provide: MenuItemsService,
          useValue: {
            create: jest.fn(),
            findByRestaurant: jest.fn(),
            findByCategory: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            toggleAvailability: jest.fn(),
            delete: jest.fn(),
            bulkCreate: jest.fn(),
            bulkDelete: jest.fn(),
            getGroupedByCategory: jest.fn(),
            getRestaurantIdForUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MenuItemsController>(MenuItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
