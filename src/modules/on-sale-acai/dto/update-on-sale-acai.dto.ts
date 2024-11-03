import { PartialType } from '@nestjs/mapped-types';
import { CreateOnSaleAcaiDto } from './create-on-sale-acai.dto';

export class UpdateOnSaleAcaiDto extends PartialType(CreateOnSaleAcaiDto) {}
