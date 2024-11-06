import { Module } from '@nestjs/common';
import { OtherProductService } from './other-product.service';
import { OtherProductController } from './other-product.controller';
import { OtherProduct } from './entities/other-product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OtherProduct])],
  controllers: [OtherProductController],
  providers: [OtherProductService],
})
export class OtherProductModule { }
