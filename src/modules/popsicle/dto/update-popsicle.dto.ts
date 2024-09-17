import { PartialType } from '@nestjs/mapped-types';
import { CreatePopsicleDto } from './create-popsicle.dto';

export class UpdatePopsicleDto extends PartialType(CreatePopsicleDto) {}
