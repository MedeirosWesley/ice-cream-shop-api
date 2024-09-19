import { Test, TestingModule } from '@nestjs/testing';
import { AcaiController } from './acai.controller';
import { AcaiService } from './acai.service';

describe('AcaiController', () => {
  let controller: AcaiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcaiController],
      providers: [AcaiService],
    }).compile();

    controller = module.get<AcaiController>(AcaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
