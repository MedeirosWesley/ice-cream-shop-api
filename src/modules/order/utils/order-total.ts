import { AcaiDto } from "src/modules/acai/dto/acai.dto";
import { DrinkOrderDto } from "src/modules/drink-order/dto/drink-order.dto";
import { IceCreamOrderDto } from "src/modules/ice-cream-order/dto/ice-cream-order.dto";
import { IceCreamPotOrder } from "src/modules/ice-cream-pot-order/entities/ice-cream-pot-order.entity";
import { MilkShakeDto } from "src/modules/milk-shake/dto/milk-shake.dto";
import { OnSaleAcaiOrder } from "src/modules/on-sale-acai-order/entities/on-sale-acai-order.entity";
import { OtherProductOrder } from "src/modules/other-product-order/entities/other-product-order.entity";
import { PopsiclesOrderDto } from "src/modules/popsicle-order/dto/popsicles-order.dto";
import { ProductOrderDto } from "../dto/product-order.dto";

/**
 * Taxa de entrega do pedido. Quem já tem taxa gravada mantém a dele, para que
 * alterar a taxa da loja só valha para pedidos novos (ou que passaram de
 * retirada para entrega).
 */
export function getDeliveryFee(type: string, isInStorePickup: boolean, currentFee: number, storedFee?: number): number {
  if (type !== 'Delivery' || isInStorePickup) {
    return 0;
  }
  return storedFee > 0 ? storedFee : currentFee;
}

/** Valor de um item do pedido (quantidade já aplicada). Mesma conta do total e do subtotal do cupom. */
export function calculateItemTotal(item: ProductOrderDto): number {
  let total = 0;
  switch (item.productType) {
    case 'acai':
      const acai = item.product as AcaiDto;
      total += item.quantity * acai.size.price;
      acai.additionals.forEach(additional => {
        total += item.quantity * (additional.additional.price * additional.quantity);
      });
      break;
    case 'milk_shake':
      const milkShake = item.product as MilkShakeDto;
      total += item.quantity * milkShake.size.price;
      milkShake.additionals.forEach(additional => {
        total += item.quantity * (additional.additional.price * additional.quantity);
      });
      break;
    case 'popsicle':
      const popsicle = item.product as PopsiclesOrderDto;
      total += item.quantity * (popsicle.popsicles.reduce((acc, popsicle) => acc + (popsicle.popsicleQuantity * popsicle.popsicle.price), 0));
      break;
    case 'drink':
      const drink = item.product as DrinkOrderDto;
      total += item.quantity * drink.drink.price;
      break;
    case 'ice_cream':
      const iceCream = item.product as IceCreamOrderDto;
      total += item.quantity * iceCream.price;
      break;
    case 'ice_cream_pot':
      const iceCreamPot = item.product as IceCreamPotOrder;
      total += item.quantity * iceCreamPot.size.price;
      break;
    case 'on_sale_acai':
      const onSaleAcai = item.product as OnSaleAcaiOrder;
      total += item.quantity * (onSaleAcai.onSaleAcai.price + onSaleAcai.additionalExtra.reduce((acc, additional) => acc + (additional.quantity * additional.additional.price), 0));
      break;
    case 'other_product':
      const otherProduct = item.product as OtherProductOrder;
      total += item.quantity * otherProduct.otherProduct.price;
      break;
    default:
      break;
  }
  return total;
}

export function calculateProductsTotal(items: ProductOrderDto[]): number {
  return items.reduce((total, item) => total + calculateItemTotal(item), 0);
}

export function calculateOrderTotal(items: ProductOrderDto[], deliveryFee: number): number {
  return calculateProductsTotal(items) + deliveryFee;
}
