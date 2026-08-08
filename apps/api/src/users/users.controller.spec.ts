import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { UserRole } from '@food_delivery/types';
import { DATABASE } from '../db/database.constants';

describe('UsersController', () => {
  let controller: UsersController;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, Reflector, { provide: DATABASE, useValue: {} }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('requires admin role for create user endpoint', () => {
    const metadata = reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      UsersController.prototype.create,
      UsersController,
    ]);

    expect(metadata).toEqual([UserRole.ADMIN]);
  });

  it('keeps the create user endpoint restricted to admin role', () => {
    const methodRoles = Reflect.getMetadata(ROLES_KEY, UsersController.prototype.create);
    const classRoles = Reflect.getMetadata(ROLES_KEY, UsersController);

    expect(methodRoles).toEqual([UserRole.ADMIN]);
    expect(classRoles).toBeUndefined();
  });
});