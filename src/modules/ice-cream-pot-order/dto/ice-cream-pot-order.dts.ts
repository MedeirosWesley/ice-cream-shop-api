import { Exclude, Expose, Transform, Type } from "class-transformer";
import { IceCreamFlavorDto } from "src/modules/ice-cream-flavor/dto/ice-cream-flavor.dto";
import { IceCreamSizeDto } from "src/modules/ice-cream-size/dto/ice-cream-size.dto";

export class IceCreamPotOrder {
  @Exclude()
  id: string;

  @Exclude()
  sizeId: string;

  @Exclude()
  flavorId: string;

  @Type(() => IceCreamSizeDto)
  @Expose()
  size: IceCreamSizeDto;

  @Transform(({ value }) => value.map(f => f.iceCreamFlavor))
  @Type(() => IceCreamFlavorDto)
  @Expose()
  flavors: IceCreamFlavorDto[];
}
