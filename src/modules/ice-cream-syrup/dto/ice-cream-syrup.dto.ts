import { Expose } from "class-transformer";

export class IceCreamSyrupDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  type: number;

  @Expose()
  availability: boolean;
}
