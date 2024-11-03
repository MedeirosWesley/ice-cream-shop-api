import { Test, TestingModule } from '@nestjs/testing';
import { OnSaleAcaiController } from './on-sale-acai.controller';
import { OnSaleAcaiService } from './on-sale-acai.service';

describe('OnSaleAcaiController', () => {
  let controller: OnSaleAcaiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnSaleAcaiController],
      providers: [OnSaleAcaiService],
    }).compile();

    controller = module.get<OnSaleAcaiController>(OnSaleAcaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
