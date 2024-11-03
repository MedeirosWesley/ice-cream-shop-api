import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsUUID, ValidateNested } from "class-validator";
import { CreateOrderAdditionalDto } from "src/modules/additional/dto/create-order-additional.dto";

export class CreateOnSaleAcaiDto {

  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsUUID('4', { each: true })
  additionals: string[];
}
