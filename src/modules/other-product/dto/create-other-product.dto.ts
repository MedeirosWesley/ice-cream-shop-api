import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateOtherProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsBoolean()
  availability: boolean;
}
