import { IsArray, IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CreateIceCreamOrderDto {
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsUUID('4', { each: true })
  flavors: string[];
}
