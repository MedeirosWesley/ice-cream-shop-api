import { Exclude, Expose, Type } from "class-transformer";
import { DrinkDto } from "src/modules/drink/dto/drink.dto";

export class DrinkOrderDto {
  @Exclude()
  id: string;

  @Exclude()
  drinkId: string;

  @Expose()
  @Type(() => DrinkDto)
  drink: DrinkDto;

}