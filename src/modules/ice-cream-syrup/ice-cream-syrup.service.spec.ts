import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamSyrupService } from './ice-cream-syrup.service';

describe('IceCreamSyrupService', () => {
  let service: IceCreamSyrupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceCreamSyrupService],
    }).compile();

    service = module.get<IceCreamSyrupService>(IceCreamSyrupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
