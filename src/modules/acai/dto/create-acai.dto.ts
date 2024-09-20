import { IsNotEmpty, IsUUID, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderAdditionalDto } from '../../additional/dto/create-order-additional.dto';

export class CreateAcaiDto {
  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdditionalDto)
  additionals: CreateOrderAdditionalDto[];
}
