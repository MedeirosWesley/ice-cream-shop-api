import { IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreatePopsicleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsNotEmpty()
  @IsBoolean()
  availability: boolean;
}
