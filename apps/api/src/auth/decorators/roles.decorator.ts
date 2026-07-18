import { UserRole } from '@food_delivery/types';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';   

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);


 

// This code creates a custom decorator called @Roles() in NestJS. It is commonly used for Role-Based Access Control (RBAC) to specify which user roles are allowed to access a route.

// we check roles like @Roles(UserRole.ADMIN, UserRole.CUSTOMER) on a route handler. 

// here it becomes
//  {
//    roles: ['ADMIN', 'CUSTOMER']
// }