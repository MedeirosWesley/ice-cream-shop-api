import { IsUUID, IsNumber, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateOrderAdditionalDto {
  @IsUUID()
  @IsNotEmpty()
  additionalId: string;  // O UUID do Additional relacionado

  @IsNumber()
  @IsNotEmpty()
  quantity: number;  // Quantidade do adicional

  @IsBoolean()
  @IsNotEmpty()
  isSeparated: boolean;  // Se o adicional está separado ou misturado no açaí
}
