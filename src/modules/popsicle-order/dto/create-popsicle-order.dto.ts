import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CreatePopsicleOrderDto {
  @IsUUID()
  @IsNotEmpty()
  popsicleId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  @IsBoolean()
  withSyrup: boolean;
}
