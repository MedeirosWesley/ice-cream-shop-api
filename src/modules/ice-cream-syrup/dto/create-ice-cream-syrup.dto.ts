import { IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateIceCreamSyrupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  type: number;

  @IsBoolean()
  availability: boolean;
}
