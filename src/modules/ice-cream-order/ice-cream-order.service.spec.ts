import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamOrderService } from './ice-cream-order.service';

describe('IceCreamOrderService', () => {
  let service: IceCreamOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceCreamOrderService],
    }).compile();

    service = module.get<IceCreamOrderService>(IceCreamOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
