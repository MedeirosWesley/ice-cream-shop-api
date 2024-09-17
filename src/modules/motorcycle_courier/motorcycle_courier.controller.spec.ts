import { Test, TestingModule } from '@nestjs/testing';
import { MotorcycleCourierController } from './motorcycle_courier.controller';
import { MotorcycleCourierService } from './motorcycle_courier.service';

describe('MotorcycleCourierController', () => {
  let controller: MotorcycleCourierController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MotorcycleCourierController],
      providers: [MotorcycleCourierService],
    }).compile();

    controller = module.get<MotorcycleCourierController>(MotorcycleCourierController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
