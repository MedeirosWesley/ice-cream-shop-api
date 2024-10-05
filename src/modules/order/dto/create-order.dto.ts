import { IsArray, IsString, IsUUID, ValidateNested } from "class-validator";
import { OrderProduct } from "../entities/order-product.entity";
import { Type } from "class-transformer";
import { CreateOrderProduct } from "./create-order-product.dto";

export class CreateOrderDto {
  @IsString()
  clientId: string;

  @IsString()
  paymentMethod: string;

  @IsUUID()
  motorcycleCourierId: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProduct)
  products: CreateOrderProduct[];
}
