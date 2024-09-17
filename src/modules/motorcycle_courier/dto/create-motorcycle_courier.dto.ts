import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMotorcycleCourierDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
