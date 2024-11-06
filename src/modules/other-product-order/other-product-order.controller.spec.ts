import { Test, TestingModule } from '@nestjs/testing';
import { OtherProductOrderController } from './other-product-order.controller';
import { OtherProductOrderService } from './other-product-order.service';

describe('OtherProductOrderController', () => {
  let controller: OtherProductOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtherProductOrderController],
      providers: [OtherProductOrderService],
    }).compile();

    controller = module.get<OtherProductOrderController>(OtherProductOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
