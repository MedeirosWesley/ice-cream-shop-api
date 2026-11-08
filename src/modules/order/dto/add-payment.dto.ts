import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class AddPaymentDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'O valor do pagamento precisa ser maior que zero.' })
  amount: number;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  // Com chave, reenviar o mesmo pagamento não soma de novo.
  @IsOptional()
  @IsUUID()
  idempotencyKey?: string;
}
