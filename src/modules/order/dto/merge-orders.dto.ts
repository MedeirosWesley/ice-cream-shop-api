import { ArrayNotEmpty, IsArray, IsString, IsNotEmpty } from 'class-validator';

export class MergeOrdersDto {
  /// Pedido que sobrevive à unificação (o primeiro selecionado no app).
  @IsNotEmpty()
  @IsString()
  targetId: string;

  /// Pedidos absorvidos pelo destino e removidos em seguida.
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sourceIds: string[];
}
