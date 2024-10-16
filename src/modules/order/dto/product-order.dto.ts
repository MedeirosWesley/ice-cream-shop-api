import { AcaiDto } from "src/modules/acai/dto/acai.dto";
import { DrinkOrderDto } from "src/modules/drink-order/dto/drink-order.dto";
import { DrinkDto } from "src/modules/drink/dto/drink.dto";
import { IceCreamOrderDto } from "src/modules/ice-cream-order/dto/ice-cream-order.dto";
import { IceCreamPotOrder } from "src/modules/ice-cream-pot-order/entities/ice-cream-pot-order.entity";
import { MilkShakeDto } from "src/modules/milk-shake/dto/milk-shake.dto";
import { PopsicleOrderDto } from "src/modules/popsicle-order/dto/popsicle-order.dto";

export class ProductOrderDto {
  id: string;
  quantity: number;
  observation?: string;
  productType: string;
  product: AcaiDto | MilkShakeDto | PopsicleOrderDto | DrinkOrderDto | IceCreamOrderDto | IceCreamPotOrder | null;

  constructor(orderProduct: any) {
    this.id = orderProduct.id;
    this.quantity = orderProduct.quantity;
    this.observation = orderProduct.observation;
    this.productType = orderProduct.productType;

    // Definir o campo `product` baseado no tipo de produto
    switch (orderProduct.productType) {
      case 'acai':
        this.product = orderProduct.acai;
        break;
      case 'milk_shake':
        this.product = orderProduct.milkShake;
        break;
      case 'popsicle':
        this.product = orderProduct.popsicle;
        break;
      case 'drink':
        this.product = orderProduct.drink;
        break;
      case 'ice_cream':
        this.product = orderProduct.iceCream;
        break;
      case 'ice_cream_pot':
        this.product = orderProduct.iceCreamPot;
        break;
      default:
        this.product = null;
    }
  }
}
