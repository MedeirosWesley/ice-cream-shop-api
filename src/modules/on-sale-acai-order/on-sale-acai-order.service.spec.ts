import { Test, TestingModule } from '@nestjs/testing';
import { OnSaleAcaiOrderService } from './on-sale-acai-order.service';

describe('OnSaleAcaiOrderService', () => {
  let service: OnSaleAcaiOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnSaleAcaiOrderService],
    }).compile();

    service = module.get<OnSaleAcaiOrderService>(OnSaleAcaiOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
