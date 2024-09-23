import { Test, TestingModule } from '@nestjs/testing';
import { DrinkOrderService } from './drink-order.service';

describe('DrinkOrderService', () => {
  let service: DrinkOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DrinkOrderService],
    }).compile();

    service = module.get<DrinkOrderService>(DrinkOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
