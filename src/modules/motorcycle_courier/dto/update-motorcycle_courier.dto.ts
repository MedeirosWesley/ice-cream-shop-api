import { PartialType } from '@nestjs/mapped-types';
import { CreateMotorcycleCourierDto } from './create-motorcycle_courier.dto';

export class UpdateMotorcycleCourierDto extends PartialType(CreateMotorcycleCourierDto) {}
