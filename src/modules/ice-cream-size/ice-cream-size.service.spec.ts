import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamSizeService } from './ice-cream-size.service';

describe('IceCreamSizeService', () => {
  let service: IceCreamSizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceCreamSizeService],
    }).compile();

    service = module.get<IceCreamSizeService>(IceCreamSizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
