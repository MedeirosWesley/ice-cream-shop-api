import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateIceCreamSizeDto {
  @IsNotEmpty()
  @IsNumber()
  size: number;

  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
