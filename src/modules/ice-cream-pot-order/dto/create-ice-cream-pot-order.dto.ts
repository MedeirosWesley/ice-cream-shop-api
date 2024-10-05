import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateIceCreamPotOrderDto {
  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @IsUUID()
  @IsNotEmpty()
  flavorId: string;
}
