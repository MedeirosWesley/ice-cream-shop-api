import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamFlavorService } from './ice-cream-flavor.service';

describe('IceCreamFlavorService', () => {
  let service: IceCreamFlavorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceCreamFlavorService],
    }).compile();

    service = module.get<IceCreamFlavorService>(IceCreamFlavorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
