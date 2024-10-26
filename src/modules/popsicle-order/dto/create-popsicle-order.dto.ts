import { IsBoolean, IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class CreatePopsicleOrderDto {
  @IsUUID()
  @IsNotEmpty()
  popsicleId: string;

  @IsNotEmpty()
  @IsBoolean()
  withSyrup: boolean;
}
