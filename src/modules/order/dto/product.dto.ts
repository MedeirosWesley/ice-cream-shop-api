import { CreateAcaiDto } from "src/modules/acai/dto/create-acai.dto";
import { CreateDrinkOrderDto } from "src/modules/drink-order/dto/create-drink-order.dto";
import { CreateIceCreamOrderDto } from "src/modules/ice-cream-order/dto/create-ice-cream-order.dto";
import { CreateIceCreamPotOrderDto } from "src/modules/ice-cream-pot-order/dto/create-ice-cream-pot-order.dto";
import { CreateMilkShakeDto } from "src/modules/milk-shake/dto/create-milk-shake.dto";
import { CreatePopsicleOrderDto } from "src/modules/popsicle-order/dto/create-popsicle-order.dto";

export interface Product {
  type: string; // Define o tipo de produto (acai, milk_shake, drink, etc.)
}

export type CreateProductDto =
  | { type: 'acai'; details: CreateAcaiDto }
  | { type: 'milk_shake'; details: CreateMilkShakeDto }
  | { type: 'drink'; details: CreateDrinkOrderDto }
  | { type: 'ice_cream'; details: CreateIceCreamOrderDto }
  | { type: 'ice_cream_pot'; details: CreateIceCreamPotOrderDto }
  | { type: 'popsicle'; details: CreatePopsicleOrderDto };