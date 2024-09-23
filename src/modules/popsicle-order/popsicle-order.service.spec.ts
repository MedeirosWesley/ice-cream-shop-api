import { Test, TestingModule } from '@nestjs/testing';
import { PopsicleOrderService } from './popsicle-order.service';

describe('PopsicleOrderService', () => {
  let service: PopsicleOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopsicleOrderService],
    }).compile();

    service = module.get<PopsicleOrderService>(PopsicleOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
