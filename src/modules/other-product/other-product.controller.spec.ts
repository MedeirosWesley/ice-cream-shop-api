import { Test, TestingModule } from '@nestjs/testing';
import { OtherProductController } from './other-product.controller';
import { OtherProductService } from './other-product.service';

describe('OtherProductController', () => {
  let controller: OtherProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtherProductController],
      providers: [OtherProductService],
    }).compile();

    controller = module.get<OtherProductController>(OtherProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
