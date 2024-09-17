import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateAdditionalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;
}