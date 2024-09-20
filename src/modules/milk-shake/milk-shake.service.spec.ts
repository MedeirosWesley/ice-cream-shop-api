import { Test, TestingModule } from '@nestjs/testing';
import { MilkShakeService } from './milk-shake.service';

describe('MilkShakeService', () => {
  let service: MilkShakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MilkShakeService],
    }).compile();

    service = module.get<MilkShakeService>(MilkShakeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
