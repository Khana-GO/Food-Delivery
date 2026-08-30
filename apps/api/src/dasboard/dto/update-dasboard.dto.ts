import { PartialType } from '@nestjs/swagger';
import { CreateDasboardDto } from './create-dasboard.dto';

export class UpdateDasboardDto extends PartialType(CreateDasboardDto) {}
