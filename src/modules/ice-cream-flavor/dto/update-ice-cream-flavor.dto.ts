import { PartialType } from '@nestjs/mapped-types';
import { CreateIceCreamFlavorDto } from './create-ice-cream-flavor.dto';

export class UpdateIceCreamFlavorDto extends PartialType(CreateIceCreamFlavorDto) {}
