import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamPotOrderController } from './ice-cream-pot-order.controller';
import { IceCreamPotOrderService } from './ice-cream-pot-order.service';

describe('IceCreamPotOrderController', () => {
  let controller: IceCreamPotOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IceCreamPotOrderController],
      providers: [IceCreamPotOrderService],
    }).compile();

    controller = module.get<IceCreamPotOrderController>(IceCreamPotOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
