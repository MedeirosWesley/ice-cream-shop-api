import { IsNumber, Min } from 'class-validator';

export class UpdateDeliveryFeeDto {
  @IsNumber()
  @Min(0)
  value: number;
}
