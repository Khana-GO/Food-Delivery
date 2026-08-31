import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Throttle({ default: { limit: 60, ttl: 60_000 } })
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  async findAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<AddressResponseDto[]> {
    return this.addressesService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single address' })
  async findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.findOne(id, user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.create(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an address' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.addressesService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an address' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.addressesService.delete(id, user.sub);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefault(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<AddressResponseDto> {
    return this.addressesService.setDefault(id, user.sub);
  }
}
