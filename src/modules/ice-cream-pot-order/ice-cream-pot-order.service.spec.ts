import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamPotOrderService } from './ice-cream-pot-order.service';

describe('IceCreamPotOrderService', () => {
  let service: IceCreamPotOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceCreamPotOrderService],
    }).compile();

    service = module.get<IceCreamPotOrderService>(IceCreamPotOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
