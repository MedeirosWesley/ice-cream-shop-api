import { PartialType } from '@nestjs/mapped-types';
import { CreateOtherProductOrderDto } from './create-other-product-order.dto';

export class UpdateOtherProductOrderDto extends PartialType(CreateOtherProductOrderDto) {}
