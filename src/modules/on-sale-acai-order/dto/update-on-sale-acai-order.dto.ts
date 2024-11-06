import { PartialType } from '@nestjs/mapped-types';
import { CreateOnSaleAcaiOrderDto } from './create-on-sale-acai-order.dto';

export class UpdateOnSaleAcaiOrderDto extends PartialType(CreateOnSaleAcaiOrderDto) {}
