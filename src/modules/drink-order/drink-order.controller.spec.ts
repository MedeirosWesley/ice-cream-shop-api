import { Test, TestingModule } from '@nestjs/testing';
import { DrinkOrderController } from './drink-order.controller';
import { DrinkOrderService } from './drink-order.service';

describe('DrinkOrderController', () => {
  let controller: DrinkOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DrinkOrderController],
      providers: [DrinkOrderService],
    }).compile();

    controller = module.get<DrinkOrderController>(DrinkOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
