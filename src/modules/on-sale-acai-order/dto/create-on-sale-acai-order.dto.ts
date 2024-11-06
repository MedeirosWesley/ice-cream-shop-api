import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { CreateOrderAdditionalDto } from "src/modules/additional/dto/create-order-additional.dto";

export class CreateOnSaleAcaiOrderDto {
  @IsUUID()
  @IsNotEmpty()
  onSaleAcaiId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdditionalDto)
  additionalExtras: CreateOrderAdditionalDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdditionalDto)
  additionalRemoved: CreateOrderAdditionalDto[];
}
