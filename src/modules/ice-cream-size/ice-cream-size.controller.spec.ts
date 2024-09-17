import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamSizeController } from './ice-cream-size.controller';
import { IceCreamSizeService } from './ice-cream-size.service';

describe('IceCreamSizeController', () => {
  let controller: IceCreamSizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IceCreamSizeController],
      providers: [IceCreamSizeService],
    }).compile();

    controller = module.get<IceCreamSizeController>(IceCreamSizeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
