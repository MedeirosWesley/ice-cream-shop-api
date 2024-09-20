import { Exclude, Expose, Transform, Type } from "class-transformer";

export class FlavorDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: number;

  @Expose()
  availability: boolean;
}

export class IceCreamFlavorDto {
  @Exclude()
  id: string;


  @Type(() => FlavorDto)
  @Expose()
  iceCreamFlavor: FlavorDto;
}