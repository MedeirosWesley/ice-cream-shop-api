import { PartialType } from '@nestjs/mapped-types';
import { CreateMilkShakeDto } from './create-milk-shake.dto';

export class UpdateMilkShakeDto extends PartialType(CreateMilkShakeDto) {}
