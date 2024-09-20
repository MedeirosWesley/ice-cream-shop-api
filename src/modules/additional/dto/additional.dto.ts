import { Expose } from "class-transformer";


export class AdditionalDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  price: number;

  @Expose()
  type: number;
}
