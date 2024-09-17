import { PartialType } from '@nestjs/mapped-types';
import { CreateIceCreamSyrupDto } from './create-ice-cream-syrup.dto';

export class UpdateIceCreamSyrupDto extends PartialType(CreateIceCreamSyrupDto) {}
