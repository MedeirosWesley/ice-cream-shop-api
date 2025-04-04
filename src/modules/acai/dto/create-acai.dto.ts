import { IsNotEmpty, IsUUID, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderAdditionalDto } from '../../additional/dto/create-order-additional.dto';

export class CreateAcaiDto {
  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @IsBoolean()
  inCup: boolean;

  @IsBoolean()
  isJuice: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdditionalDto)
  additionals: CreateOrderAdditionalDto[];
}
