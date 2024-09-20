import { Expose } from "class-transformer";



export class IceCreamSizeDto {
  @Expose()
  id: string;

  @Expose()
  size: number;

  @Expose()
  type: number;

  @Expose()
  price: number;
}
