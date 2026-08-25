import { PartialType } from '@nestjs/swagger';
import { CreateMenuItemDto } from './create-menu.dto';

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {}
