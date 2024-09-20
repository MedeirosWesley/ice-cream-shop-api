import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from "class-validator";
import { CreateOrderAdditionalDto } from "src/modules/additional/dto/create-order-additional.dto";

export class CreateMilkShakeDto {
  @IsUUID()
  @IsNotEmpty()
  sizeId: string;

  @IsUUID()
  @IsNotEmpty()
  syrupId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderAdditionalDto)
  additionals: CreateOrderAdditionalDto[];

  @IsArray()
  @IsUUID('4', { each: true })
  flavors: string[];


}
