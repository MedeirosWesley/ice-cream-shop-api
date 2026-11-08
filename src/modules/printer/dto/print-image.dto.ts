import { IsString } from 'class-validator';

export class PrintImageDto {
  @IsString()
  imageUrl: string;
}
