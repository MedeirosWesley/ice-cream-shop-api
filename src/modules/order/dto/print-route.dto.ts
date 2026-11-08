import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class PrintRouteDto {
  /// Pedidos da rota, na ordem em que foram selecionados no app.
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  orderIds: string[];

  /// Entregador que leva a rota (gravado em cada pedido).
  @IsOptional()
  @IsString()
  motorcycleCourierId?: string;
}
