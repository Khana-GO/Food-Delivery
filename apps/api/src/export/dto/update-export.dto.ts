import { PartialType } from '@nestjs/swagger';
import { CreateExportDto } from './create-export.dto';

export class UpdateExportDto extends PartialType(CreateExportDto) {}
