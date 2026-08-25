import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-menu-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
