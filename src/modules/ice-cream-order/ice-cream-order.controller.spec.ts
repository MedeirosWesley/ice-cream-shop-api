import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamOrderController } from './ice-cream-order.controller';
import { IceCreamOrderService } from './ice-cream-order.service';

describe('IceCreamOrderController', () => {
  let controller: IceCreamOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IceCreamOrderController],
      providers: [IceCreamOrderService],
    }).compile();

    controller = module.get<IceCreamOrderController>(IceCreamOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
