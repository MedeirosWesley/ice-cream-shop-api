import { IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateDrinkDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  size: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsBoolean()
  availability: boolean;
}
