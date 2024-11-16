import { AcaiDto } from "src/modules/acai/dto/acai.dto";
import { DrinkOrderDto } from "src/modules/drink-order/dto/drink-order.dto";
import { IceCreamOrderDto } from "src/modules/ice-cream-order/dto/ice-cream-order.dto";
import { IceCreamPotOrder } from "src/modules/ice-cream-pot-order/entities/ice-cream-pot-order.entity";
import { MilkShakeDto } from "src/modules/milk-shake/dto/milk-shake.dto";
import { OnSaleAcaiOrder } from "src/modules/on-sale-acai-order/entities/on-sale-acai-order.entity";
import { OtherProductOrder } from "src/modules/other-product-order/entities/other-product-order.entity";
import { PopsiclesOrderDto } from "src/modules/popsicle-order/dto/popsicles-order.dto";

export class ProductOrderDto {
  id: string;
  quantity: number;
  observation?: string;
  productType: string;
  product: AcaiDto | MilkShakeDto | PopsiclesOrderDto | DrinkOrderDto | IceCreamOrderDto | IceCreamPotOrder | OnSaleAcaiOrder | OtherProductOrder | null;

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
      case 'on_sale_acai':
        this.product = orderProduct.onSaleAcai;
        break;
      case 'other_product':
        this.product = orderProduct.otherProduct;
      default:
        this.product = null;
    }
  }
}
