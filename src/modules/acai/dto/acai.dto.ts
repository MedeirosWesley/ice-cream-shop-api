import { Expose, Type } from "class-transformer";
import { OrderAdditionalDto } from "../../additional/dto/order-additional.dto";
import { IceCreamSizeDto } from "../../ice-cream-size/dto/ice-cream-size.dto";




export class AcaiDto {
  @Expose()
  id: string;

  @Type(() => OrderAdditionalDto)
  @Expose()
  additionals: OrderAdditionalDto[];

  @Type(() => IceCreamSizeDto)
  @Expose()
  size: IceCreamSizeDto;
}
