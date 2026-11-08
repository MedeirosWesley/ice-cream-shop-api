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
jest.mock('../printer/printer.service', () => ({ PrinterService: class { } }));
jest.mock('./sales-report.service', () => ({ SalesReportService: class { } }));
jest.mock('./order-relations', () => ({ ORDER_RELATIONS: [] }));

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const KEY = '7d9f1c3a-8a51-4f0e-9f6a-0a6f4f3b1c11';
const saved = { id: 'order-1', type: 'Store' };

function buildService(findOneResults: unknown[] = [null]) {
  const orderRepository = {
    findOne: jest.fn().mockImplementation(async () =>
      findOneResults.length > 1 ? findOneResults.shift() : findOneResults[0]),
    update: jest.fn(),
  };
  const service = new (OrderService as any)(
    {}, orderRepository, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
    { orderChanged: jest.fn(), catalogChanged: jest.fn() },
  ) as OrderService;
  return { service, orderRepository };
}

describe('createIdempotent', () => {
  it('returns the existing order without creating another', async () => {
    const { service } = buildService([saved]);
    const create = jest.spyOn(service, 'create');

    const result = await service.createIdempotent({ idempotencyKey: KEY } as any);

    expect(result).toEqual({ order: saved, created: false });
    expect(create).not.toHaveBeenCalled();
  });

  it('creates once for concurrent requests with the same key', async () => {
    const { service } = buildService();
    const create = jest.spyOn(service, 'create').mockResolvedValue(saved as any);

    const [first, second] = await Promise.all([
      service.createIdempotent({ idempotencyKey: KEY } as any),
      service.createIdempotent({ idempotencyKey: KEY } as any),
    ]);

    expect(create).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ order: saved, created: true });
    expect(second).toEqual({ order: saved, created: false });
  });

  it('falls back to the stored order on a UNIQUE violation', async () => {
    const { service } = buildService([null, saved]);
    jest.spyOn(service, 'create').mockRejectedValue(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed'));

    await expect(service.createIdempotent({ idempotencyKey: KEY } as any))
      .resolves.toEqual({ order: saved, created: false });
  });

  it('propagates other failures and allows a later retry', async () => {
    const { service } = buildService();
    const create = jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('boom'));

    await expect(service.createIdempotent({ idempotencyKey: KEY } as any)).rejects.toThrow('boom');

    create.mockResolvedValueOnce(saved as any);
    await expect(service.createIdempotent({ idempotencyKey: KEY } as any))
      .resolves.toEqual({ order: saved, created: true });
  });
});

describe('claimPrint', () => {
  it('is true only when a row was claimed', async () => {
    const { service, orderRepository } = buildService();

    orderRepository.update.mockResolvedValueOnce({ affected: 1 });
    await expect(service.claimPrint('order-1')).resolves.toBe(true);

    orderRepository.update.mockResolvedValueOnce({ affected: 0 });
    await expect(service.claimPrint('order-1')).resolves.toBe(false);
  });
});

describe('POST /order with a key', () => {
  function buildController(claim: boolean, printOrder = jest.fn().mockResolvedValue(undefined)) {
    const orderService = {
      createIdempotent: jest.fn().mockResolvedValue({ order: saved, created: true }),
      claimPrint: jest.fn().mockResolvedValue(claim),
      findOne: jest.fn().mockResolvedValue(saved),
    };
    const controller = new OrderController(orderService as any, { printOrder } as any, {} as any);
    return { controller, orderService, printOrder };
  }

  it('prints when the claim is won', async () => {
    const { controller, printOrder } = buildController(true);
    await expect(controller.create({ idempotencyKey: KEY } as any)).resolves.toMatchObject({ id: 'order-1', printed: true });
    expect(printOrder).toHaveBeenCalledTimes(1);
  });

  it('does not print when the claim is lost', async () => {
    const { controller, printOrder } = buildController(false);
    await expect(controller.create({ idempotencyKey: KEY } as any)).resolves.toMatchObject({ printed: false });
    expect(printOrder).not.toHaveBeenCalled();
  });

  it('honours skipPrint without claiming', async () => {
    const { controller, orderService, printOrder } = buildController(true);
    await expect(controller.create({ idempotencyKey: KEY, skipPrint: true } as any)).resolves.toMatchObject({ printed: false });
    expect(orderService.claimPrint).not.toHaveBeenCalled();
    expect(printOrder).not.toHaveBeenCalled();
  });

  it('does not fail the request when printing fails', async () => {
    const { controller } = buildController(true, jest.fn().mockRejectedValue(new Error('offline')));
    jest.spyOn((controller as any).logger, 'error').mockImplementation(() => undefined);
    await expect(controller.create({ idempotencyKey: KEY } as any)).resolves.toMatchObject({ id: 'order-1', printed: false });
  });
});
