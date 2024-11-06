import { PartialType } from '@nestjs/mapped-types';
import { CreateOtherProductDto } from './create-other-product.dto';

export class UpdateOtherProductDto extends PartialType(CreateOtherProductDto) {}
