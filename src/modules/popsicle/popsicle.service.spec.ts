import { Test, TestingModule } from '@nestjs/testing';
import { PopsicleService } from './popsicle.service';

describe('PopsicleService', () => {
  let service: PopsicleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopsicleService],
    }).compile();

    service = module.get<PopsicleService>(PopsicleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
