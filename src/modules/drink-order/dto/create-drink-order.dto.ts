import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateDrinkOrderDto {
  @IsUUID()
  @IsNotEmpty()
  drinkId: string;
}
