import { Test, TestingModule } from '@nestjs/testing';
import { OtherProductService } from './other-product.service';

describe('OtherProductService', () => {
  let service: OtherProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtherProductService],
    }).compile();

    service = module.get<OtherProductService>(OtherProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
