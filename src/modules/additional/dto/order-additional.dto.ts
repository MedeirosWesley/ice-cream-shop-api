import { Expose, Type } from "class-transformer";
import { AdditionalDto } from "./additional.dto";




export class OrderAdditionalDto {
  @Expose()
  quantity: number;

  @Expose()
  isSeparated: boolean;

  @Type(() => AdditionalDto)
  @Expose()
  additional: AdditionalDto;
}
