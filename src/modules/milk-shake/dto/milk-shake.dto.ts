import { Expose, Transform, Type } from "class-transformer";
import { OrderAdditionalDto } from "src/modules/additional/dto/order-additional.dto";
import { FlavorDto, IceCreamFlavorDto } from "src/modules/ice-cream-flavor/dto/ice-cream-flavor.dto";
import { IceCreamSizeDto } from "src/modules/ice-cream-size/dto/ice-cream-size.dto";
import { IceCreamSyrupDto } from "src/modules/ice-cream-syrup/dto/ice-cream-syrup.dto";


export class MilkShakeDto {
  @Expose()
  id: string;

  @Type(() => OrderAdditionalDto)
  @Expose()
  additionals: OrderAdditionalDto[];

  @Transform(({ value }) => value.map(f => f.iceCreamFlavor))
  @Type(() => IceCreamFlavorDto)
  @Expose()
  flavors: IceCreamFlavorDto[];

  @Type(() => IceCreamSizeDto)
  @Expose()
  size: IceCreamSizeDto;

  @Type(() => IceCreamSyrupDto)
  @Expose()
  syrup: IceCreamSyrupDto;
}
