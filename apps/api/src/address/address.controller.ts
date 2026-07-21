import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@Body() createAddressDto: any, @Request() req: any) {
    return this.addressService.create(createAddressDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.addressService.findAll(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddressDto: any, @Request() req: any) {
    return this.addressService.update(id, req.user.userId, updateAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.addressService.remove(id, req.user.userId);
  }
}
