import { UserRole } from '@food_delivery/types';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

// Makes this guard available for dependency injection
@Injectable()
export class RolesGuard implements CanActivate {

  // Inject Reflector to read metadata added by @Roles()
  constructor(private readonly reflector: Reflector) {}

  // This method runs before the controller method
  canActivate(context: ExecutionContext): boolean {

    // Read the roles metadata from the current route or controller
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [
        context.getHandler(), // Current method
        context.getClass(),   // Current controller
      ],
    );

    // If no roles are specified, allow everyone
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the Express request and extract the authenticated user
    // The AuthGuard should already have attached `user` to the request
    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();

    // Check whether the user's role is one of the allowed roles
    // true  -> Access granted
    // false -> Access denied (403 Forbidden)
    return requiredRoles.includes(user.role as UserRole);
  }
}