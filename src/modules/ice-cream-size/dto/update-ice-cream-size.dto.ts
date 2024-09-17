import { PartialType } from '@nestjs/mapped-types';
import { CreateIceCreamSizeDto } from './create-ice-cream-size.dto';

export class UpdateIceCreamSizeDto extends PartialType(CreateIceCreamSizeDto) {}
