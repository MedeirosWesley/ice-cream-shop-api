import { Exclude, Expose, Transform, Type } from "class-transformer";
import { FlavorDto, IceCreamFlavorDto } from "src/modules/ice-cream-flavor/dto/ice-cream-flavor.dto";

export class IceCreamOrderDto {
  @Exclude()
  id: string;

  @Expose()
  price: number;

  @Transform(({ value }) => value.map(f => f.iceCreamFlavor))
  @Type(() => IceCreamFlavorDto)
  @Expose()
  flavors: IceCreamFlavorDto[];

}