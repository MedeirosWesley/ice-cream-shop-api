import { IsArray, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { OrderProduct } from "../entities/order-product.entity";
import { Type } from "class-transformer";
import { CreateOrderProduct } from "./create-order-product.dto";
import { Optional } from "@nestjs/common";
import { CreateClientDto } from "src/modules/client/dto/create-client.dto";

export class CreateOrderDto {

  @IsString()
  @IsOptional()
  clientId: string;

  @IsString()
  @IsOptional()
  clientName: string;

  @IsOptional()
  @Type(() => CreateClientDto)
  client: CreateClientDto;

  @IsOptional()
  @IsString()
  paymentMethod: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsUUID()
  motorcycleCourierId: string;

  @IsOptional()
  @IsNumber()
  amountPaid: number;

  @IsOptional()
  @IsString()
  status: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProduct)
  products: CreateOrderProduct[];
}
