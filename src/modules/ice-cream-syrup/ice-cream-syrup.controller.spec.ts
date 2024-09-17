import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamSyrupController } from './ice-cream-syrup.controller';
import { IceCreamSyrupService } from './ice-cream-syrup.service';

describe('IceCreamSyrupController', () => {
  let controller: IceCreamSyrupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IceCreamSyrupController],
      providers: [IceCreamSyrupService],
    }).compile();

    controller = module.get<IceCreamSyrupController>(IceCreamSyrupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
