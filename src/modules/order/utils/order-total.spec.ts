import { calculateItemTotal, calculateOrderTotal, calculateProductsTotal, getDeliveryFee } from './order-total';
import { ProductOrderDto } from '../dto/product-order.dto';

const acaiItem = {
  quantity: 2,
  productType: 'acai',
  product: {
    size: { price: 15 },
    additionals: [{ quantity: 2, additional: { price: 3 } }],
  },
} as unknown as ProductOrderDto;

const drinkItem = {
  quantity: 3,
  productType: 'drink',
  product: { drink: { price: 5 } },
} as unknown as ProductOrderDto;

describe('order-total', () => {
  it('multiplica o adicional pela quantidade dele e pela do item', () => {
    // 2 x (15 + 2 x 3)
    expect(calculateItemTotal(acaiItem)).toBe(42);
  });

  it('soma os itens do pedido', () => {
    expect(calculateProductsTotal([acaiItem, drinkItem])).toBe(57);
  });

  it('cobra taxa só em entrega que não é retirada no balcão', () => {
    expect(getDeliveryFee('Delivery', false, 2)).toBe(2);
    expect(getDeliveryFee('Delivery', true, 2)).toBe(0);
    expect(getDeliveryFee('Store', false, 2)).toBe(0);
    expect(calculateOrderTotal([drinkItem], 2)).toBe(17);
  });

  it('mantém a taxa já gravada no pedido mesmo que a da loja mude', () => {
    expect(getDeliveryFee('Delivery', false, 4, 3.5)).toBe(3.5);
    expect(getDeliveryFee('Delivery', false, 4, 0)).toBe(4);
    expect(getDeliveryFee('Delivery', false, 4, null)).toBe(4);
    expect(getDeliveryFee('Delivery', true, 4, 3.5)).toBe(0);
  });

  it('ignora tipo de produto desconhecido', () => {
    expect(calculateItemTotal({ quantity: 1, productType: 'x' } as ProductOrderDto)).toBe(0);
  });
});
