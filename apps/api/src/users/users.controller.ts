import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // Get Current User Profile (Authenticated users)
  // ──────────────────────────────────────────────────────────────────────────

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getProfile(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByIdOrThrow(currentUser.sub);
    return new UserResponseDto(user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Update Current User Profile (Authenticated users)
  // ──────────────────────────────────────────────────────────────────────────

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered',
  })
  async updateProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const { firstName, lastName, email, phone } = updateUserDto;
    const allowed: Partial<UpdateUserDto> = {};
    if (firstName !== undefined) allowed.firstName = firstName;
    if (lastName !== undefined) allowed.lastName = lastName;
    if (email !== undefined) allowed.email = email;
    if (phone !== undefined && phone !== null && String(phone).trim() !== '') {
      allowed.phone = String(phone).trim();
    }
    const user = await this.usersService.update(currentUser.sub, allowed);
    return new UserResponseDto(user);
  }

  @Post('profile/image')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.RESTAURANT_OWNER,
    UserRole.DRIVER,
    UserRole.ADMIN,
  )
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(
    @CurrentUser() currentUser: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.uploadProfileImage(
      currentUser.sub,
      file,
    );
    return new UserResponseDto(user);
  }

  @Delete('profile/image')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.RESTAURANT_OWNER,
    UserRole.DRIVER,
    UserRole.ADMIN,
  )
  @HttpCode(HttpStatus.OK)
  async deleteProfileImage(
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.deleteProfileImage(currentUser.sub);
    return new UserResponseDto(user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Create User
  // ──────────────────────────────────────────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Get All Users (with pagination and filters)
  // NOTE: Specific routes must be before :id param routes
  // ──────────────────────────────────────────────────────────────────────────

  @Get('deleted/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all soft-deleted users (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deleted users fetched successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async getDeletedUsers(@Query() query: FindUsersDto): Promise<{
    data: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.usersService.findDeleted({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
    return {
      ...result,
      data: result.data.map((u) => new UserResponseDto(u)),
    };
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User statistics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async getUserStats() {
    return this.usersService.getStatistics();
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all users with pagination and filters (Admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users fetched successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async findAll(@Query() query: FindUsersDto) {
    return this.usersService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role,
      isVerified:
        query.isVerified !== undefined
          ? query.isVerified === 'true'
          : undefined,
      isOnline:
        query.isOnline !== undefined ? query.isOnline === 'true' : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Change User Role (must be before :id routes for PATCH)
  // ──────────────────────────────────────────────────────────────────────────

  @Patch('role')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user role (Admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Role changed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot remove last admin',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async changeRole(
    @CurrentUser() actor: JwtPayload,
    @Body() changeRoleDto: ChangeRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.changeRole(
      changeRoleDto.userId,
      changeRoleDto.role,
      actor.sub,
    );
    return new UserResponseDto(user);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Get User by ID, Update, Restore, Delete — param routes last
  // ──────────────────────────────────────────────────────────────────────────

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User fetched successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.findByIdOrThrow(id);
    return new UserResponseDto(user);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already registered',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // Prevent role escalation via generic update – use dedicated role endpoint
    const { role, ...safeData } = updateUserDto as any;
    if (role) {
      // silently ignore role in generic update
    }
    const user = await this.usersService.update(id, safeData);
    return new UserResponseDto(user);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User restored successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found or not deleted',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async restore(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.restore(id);
    return new UserResponseDto(user);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permanently deleted',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete last admin',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async hardDelete(
    @CurrentUser() actor: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.hardDelete(id, actor.sub);
    return { message: 'User permanently deleted' };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete last admin',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin only',
  })
  async delete(
    @CurrentUser() actor: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    await this.usersService.softDelete(id, actor.sub);
    return { message: 'User deleted successfully' };
  }
}
