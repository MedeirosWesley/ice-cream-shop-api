import { Expose } from "class-transformer";

export class PopsicleDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  type: number;

  @Expose()
  availability: boolean;

}