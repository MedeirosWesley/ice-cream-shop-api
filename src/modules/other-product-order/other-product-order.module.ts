import { Module } from '@nestjs/common';
import { OtherProductOrderService } from './other-product-order.service';
import { OtherProductOrderController } from './other-product-order.controller';
import { OtherProductOrder } from './entities/other-product-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OtherProductOrder])],
  controllers: [OtherProductOrderController],
  providers: [OtherProductOrderService],
  exports: [OtherProductOrderService],
})
export class OtherProductOrderModule { }
