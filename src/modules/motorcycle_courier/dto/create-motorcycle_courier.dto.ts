import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMotorcycleCourierDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone: string;
}
