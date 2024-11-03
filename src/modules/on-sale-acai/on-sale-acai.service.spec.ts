import { Test, TestingModule } from '@nestjs/testing';
import { OnSaleAcaiService } from './on-sale-acai.service';

describe('OnSaleAcaiService', () => {
  let service: OnSaleAcaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnSaleAcaiService],
    }).compile();

    service = module.get<OnSaleAcaiService>(OnSaleAcaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
