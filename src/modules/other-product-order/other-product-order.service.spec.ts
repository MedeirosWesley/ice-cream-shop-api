import { Test, TestingModule } from '@nestjs/testing';
import { OtherProductOrderService } from './other-product-order.service';

describe('OtherProductOrderService', () => {
  let service: OtherProductOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtherProductOrderService],
    }).compile();

    service = module.get<OtherProductOrderService>(OtherProductOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
