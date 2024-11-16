import { Exclude, Expose } from "class-transformer";
import { PopsicleOrderDto } from "./popsicle-order.dto";

export class PopsiclesOrderDto {
  @Exclude()
  id: string;

  @Expose()
  popsicles: PopsicleOrderDto[];
}