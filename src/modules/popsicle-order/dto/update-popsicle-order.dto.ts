import { PartialType } from '@nestjs/mapped-types';
import { CreatePopsicleOrderDto, CreatePopsiclesOrderDto } from './create-popsicle-order.dto';

export class UpdatePopsicleOrderDto extends PartialType(CreatePopsiclesOrderDto) { }
