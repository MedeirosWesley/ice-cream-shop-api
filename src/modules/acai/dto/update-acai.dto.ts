import { PartialType } from '@nestjs/mapped-types';
import { CreateAcaiDto } from './create-acai.dto';

export class UpdateAcaiDto extends PartialType(CreateAcaiDto) {}
