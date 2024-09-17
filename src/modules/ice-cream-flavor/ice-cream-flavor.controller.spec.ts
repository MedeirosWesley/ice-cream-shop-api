import { Test, TestingModule } from '@nestjs/testing';
import { IceCreamFlavorController } from './ice-cream-flavor.controller';
import { IceCreamFlavorService } from './ice-cream-flavor.service';

describe('IceCreamFlavorController', () => {
  let controller: IceCreamFlavorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IceCreamFlavorController],
      providers: [IceCreamFlavorService],
    }).compile();

    controller = module.get<IceCreamFlavorController>(IceCreamFlavorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
