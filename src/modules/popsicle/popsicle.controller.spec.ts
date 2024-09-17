import { Test, TestingModule } from '@nestjs/testing';
import { PopsicleController } from './popsicle.controller';
import { PopsicleService } from './popsicle.service';

describe('PopsicleController', () => {
  let controller: PopsicleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopsicleController],
      providers: [PopsicleService],
    }).compile();

    controller = module.get<PopsicleController>(PopsicleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
