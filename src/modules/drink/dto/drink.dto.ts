import { Exclude, Expose } from "class-transformer";

export class DrinkDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  price: number;
  @Expose()
  size: number;
  @Expose()
  type: number;
  @Expose()
  availability: boolean;
}