import { PartialType } from '@nestjs/mapped-types';
import { CreateIceCreamOrderDto } from './create-ice-cream-order.dto';

export class UpdateIceCreamOrderDto extends PartialType(CreateIceCreamOrderDto) {}
