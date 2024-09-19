import { Test, TestingModule } from '@nestjs/testing';
import { AcaiService } from './acai.service';

describe('AcaiService', () => {
  let service: AcaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcaiService],
    }).compile();

    service = module.get<AcaiService>(AcaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
