// O jest deste projeto não resolve imports "src/...": tudo que os carrega em
// tempo de execução é substituído aqui.
jest.mock('./entities/order.entity', () => ({ Order: class Order { } }));
jest.mock('./entities/order-product.entity', () => ({ OrderProduct: class OrderProduct { } }));
jest.mock('../client/entities/client.entity', () => ({ Client: class Client { } }));
jest.mock('../motorcycle_courier/entities/motorcycle_courier.entity', () => ({ MotorcycleCourier: class MotorcycleCourier { } }));
jest.mock('./dto/create-order.dto', () => ({ CreateOrderDto: class CreateOrderDto { } }));
jest.mock('./dto/update-order.dto', () => ({ UpdateOrderDto: class UpdateOrderDto { } }));
jest.mock('./dto/order.dto', () => ({ OrderDto: { fromEntity: (order: unknown) => order } }));
jest.mock('../acai/acai.service', () => ({ AcaiService: class { } }));
jest.mock('../milk-shake/milk-shake.service', () => ({ MilkShakeService: class { } }));
jest.mock('../ice-cream-order/ice-cream-order.service', () => ({ IceCreamOrderService: class { } }));
jest.mock('../ice-cream-pot-order/ice-cream-pot-order.service', () => ({ IceCreamPotOrderService: class { } }));
jest.mock('../drink-order/drink-order.service', () => ({ DrinkOrderService: class { } }));
jest.mock('../popsicle-order/popsicle-order.service', () => ({ PopsicleOrderService: class { } }));
jest.mock('../client/client.service', () => ({ ClientService: class { } }));
jest.mock('../on-sale-acai-order/on-sale-acai-order.service', () => ({ OnSaleAcaiOrderService: class { } }));
jest.mock('../other-product-order/other-product-order.service', () => ({ OtherProductOrderService: class { } }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class { } }));
jest.mock('./order-relations', () => ({ ORDER_RELATIONS: [] }));

import { OrderService } from './order.service';

const KEY = '7d9f1c3a-8a51-4f0e-9f6a-0a6f4f3b1c11';

function build(row: Record<string, unknown>, unpaid = 2) {
  const keys = new Set<string>();
  const manager = {
    findOne: jest.fn().mockImplementation(async (_entity: unknown, options: any) => {
      if (options.where.key) return keys.has(options.where.key) ? { key: options.where.key } : null;
      return { ...row };
    }),
    insert: jest.fn().mockImplementation(async (_entity: unknown, value: any) => {
      if (keys.has(value.key)) throw new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed');
      keys.add(value.key);
    }),
    update: jest.fn().mockImplementation(async (_entity: unknown, _id: string, changes: any) => {
      Object.assign(row, changes);
    }),
    query: jest.fn().mockImplementation(async (sql: string) => {
      if (sql.startsWith('SELECT')) return [{ unpaid }];
      unpaid = 0;
      return [];
    }),
  };
  const dataSource = { manager, transaction: jest.fn().mockImplementation(work => work(manager)) };
  const orderRepository = {
    findOne: jest.fn().mockImplementation(async () => ({ ...row })),
    update: jest.fn().mockImplementation(async (_id: string, changes: any) => {
      Object.assign(row, changes);
    }),
  };
  const events = { orderChanged: jest.fn() };
  const service = new (OrderService as any)(
    dataSource, orderRepository, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, events,
  ) as OrderService;
  return { service, row, manager, events, orderRepository };
}

describe('addPayment with a key', () => {
  it('adds once when the key repeats', async () => {
    const { service, row, events } = build({ id: 'o', type: 'Store', amountPaid: '5.00' });

    await service.addPayment('o', 10, undefined, KEY);
    await service.addPayment('o', 10, undefined, KEY);

    expect(row.amountPaid).toBe(15);
    expect(events.orderChanged).toHaveBeenCalledTimes(1);
  });

  it('adds once for concurrent requests with the same key', async () => {
    const { service, row, events } = build({ id: 'o', type: 'Store', amountPaid: 0 });

    await Promise.all([
      service.addPayment('o', 10, undefined, KEY),
      service.addPayment('o', 10, undefined, KEY),
    ]);

    expect(row.amountPaid).toBe(10);
    expect(events.orderChanged).toHaveBeenCalledTimes(1);
  });

  it('treats a UNIQUE error as a repeat, without an event', async () => {
    const { service, row, manager, events } = build({ id: 'o', type: 'Store', amountPaid: 0 });
    manager.insert.mockRejectedValueOnce(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed'));

    await service.addPayment('o', 10, undefined, KEY);

    expect(row.amountPaid).toBe(0);
    expect(events.orderChanged).not.toHaveBeenCalled();
  });

  it('keeps the first payment method', async () => {
    const { service, row } = build({ id: 'o', type: 'Store', amountPaid: 0, paymentMethod: 'Pix' });

    await service.addPayment('o', 10, 'Dinheiro', KEY);

    expect(row.paymentMethod).toBe('Pix');
  });

  it('still adds on every call without a key', async () => {
    const { service, row, manager } = build({ id: 'o', type: 'Store', amountPaid: 0 });

    await service.addPayment('o', 10);
    await service.addPayment('o', 10);

    expect(row.amountPaid).toBe(20);
    expect(manager.insert).not.toHaveBeenCalled();
  });
});

describe('createIdempotent with paidInFull', () => {
  const dto = { idempotencyKey: KEY, paidInFull: true } as any;

  function withStoredOrder(row: Record<string, unknown>) {
    const built = build(row);
    built.orderRepository.findOne.mockResolvedValue({ id: 'o', type: 'Delivery' });
    return built;
  }

  it('marks items and covers the fee on a repeated key', async () => {
    const { service, row, manager, events } = withStoredOrder({ id: 'o', type: 'Delivery', amountPaid: 0, deliveryFee: '3.00' });

    const { order } = await service.createIdempotent(dto);

    expect(manager.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE order_product'), ['o']);
    expect(row.amountPaid).toBe(3);
    expect(order.amountPaid).toBe(3);
    expect(events.orderChanged).toHaveBeenCalledWith('Delivery', 'o', 'paid');
  });

  it('changes nothing the second time', async () => {
    const { service, row, events } = withStoredOrder({ id: 'o', type: 'Delivery', amountPaid: 0, deliveryFee: 3 });

    await service.createIdempotent(dto);
    await service.createIdempotent(dto);

    expect(row.amountPaid).toBe(3);
    expect(events.orderChanged).toHaveBeenCalledTimes(1);
  });

  it('does not lower a larger amount already paid', async () => {
    const { service, row } = withStoredOrder({ id: 'o', type: 'Delivery', amountPaid: 10, deliveryFee: 3 });

    await service.createIdempotent(dto);

    expect(row.amountPaid).toBe(10);
  });

  it('leaves the order untouched without the flag', async () => {
    const { service, manager } = withStoredOrder({ id: 'o', type: 'Delivery', amountPaid: 0, deliveryFee: 3 });

    await service.createIdempotent({ idempotencyKey: KEY } as any);

    expect(manager.query).not.toHaveBeenCalled();
  });
});
