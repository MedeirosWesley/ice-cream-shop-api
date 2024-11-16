import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsUUID, ValidateNested } from "class-validator";

export class CreatePopsiclesOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePopsicleOrderDto)
  popsicles: CreatePopsicleOrderDto[];


}
export class CreatePopsicleOrderDto {
  @IsUUID()
  @IsNotEmpty()
  popsicleId: string;

  @IsNumber()
  popsicleQuantity: number;


  @IsNotEmpty()
  @IsBoolean()
  withSyrup: boolean;
}


