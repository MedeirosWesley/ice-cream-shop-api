import { Test, TestingModule } from '@nestjs/testing';
import { MilkShakeController } from './milk-shake.controller';
import { MilkShakeService } from './milk-shake.service';

describe('MilkShakeController', () => {
  let controller: MilkShakeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilkShakeController],
      providers: [MilkShakeService],
    }).compile();

    controller = module.get<MilkShakeController>(MilkShakeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
