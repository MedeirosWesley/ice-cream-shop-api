import { Test, TestingModule } from '@nestjs/testing';
import { PopsicleOrderController } from './popsicle-order.controller';
import { PopsicleOrderService } from './popsicle-order.service';

describe('PopsicleOrderController', () => {
  let controller: PopsicleOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopsicleOrderController],
      providers: [PopsicleOrderService],
    }).compile();

    controller = module.get<PopsicleOrderController>(PopsicleOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
