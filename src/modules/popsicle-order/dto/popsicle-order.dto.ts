import { Exclude, Expose, Type } from "class-transformer";
import { PopsicleDto } from "src/modules/popsicle/dto/popsicle.dto";

export class PopsicleOrderDto {
  @Exclude()
  id: string;

  @Exclude()
  popsicleId: string;

  @Expose()
  withSyrup: boolean;

  @Type(() => PopsicleDto)
  @Expose()
  popsicle: PopsicleDto;

}
