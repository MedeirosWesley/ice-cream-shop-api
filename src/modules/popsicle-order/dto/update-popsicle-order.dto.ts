import { PartialType } from '@nestjs/mapped-types';
import { CreatePopsicleOrderDto } from './create-popsicle-order.dto';

export class UpdatePopsicleOrderDto extends PartialType(CreatePopsicleOrderDto) {}
