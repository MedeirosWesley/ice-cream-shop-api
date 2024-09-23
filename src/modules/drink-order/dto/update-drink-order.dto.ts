import { PartialType } from '@nestjs/mapped-types';
import { CreateDrinkOrderDto } from './create-drink-order.dto';

export class UpdateDrinkOrderDto extends PartialType(CreateDrinkOrderDto) {}
