import { IsNotEmpty, IsUUID, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderAdditionalDto } from './create-order-additional.dto';

export class CreateAcaiDto {
  @IsUUID()
  @IsNotEmpty()
  sizeId: string;  // Referência ao tamanho do açaí

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdditionalDto)
  additionals: CreateOrderAdditionalDto[];  // Array de adicionais para o pedido
}
