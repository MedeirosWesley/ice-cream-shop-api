import { PartialType } from '@nestjs/mapped-types';
import { CreateIceCreamPotOrderDto } from './create-ice-cream-pot-order.dto';

export class UpdateIceCreamPotOrderDto extends PartialType(CreateIceCreamPotOrderDto) {}
