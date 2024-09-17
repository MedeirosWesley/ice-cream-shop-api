import { Test, TestingModule } from '@nestjs/testing';
import { MotorcycleCourierService } from './motorcycle_courier.service';

describe('MotorcycleCourierService', () => {
  let service: MotorcycleCourierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MotorcycleCourierService],
    }).compile();

    service = module.get<MotorcycleCourierService>(MotorcycleCourierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
