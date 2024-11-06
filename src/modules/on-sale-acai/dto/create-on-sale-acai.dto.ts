import { IsArray, IsNotEmpty, IsNumber, IsUUID, ValidateNested } from "class-validator";

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
