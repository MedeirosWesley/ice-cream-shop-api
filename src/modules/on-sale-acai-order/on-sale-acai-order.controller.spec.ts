import { Test, TestingModule } from '@nestjs/testing';
import { OnSaleAcaiOrderController } from './on-sale-acai-order.controller';
import { OnSaleAcaiOrderService } from './on-sale-acai-order.service';

describe('OnSaleAcaiOrderController', () => {
  let controller: OnSaleAcaiOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnSaleAcaiOrderController],
      providers: [OnSaleAcaiOrderService],
    }).compile();

    controller = module.get<OnSaleAcaiOrderController>(OnSaleAcaiOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
