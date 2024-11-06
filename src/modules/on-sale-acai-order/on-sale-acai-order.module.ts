import { Module } from '@nestjs/common';
import { OnSaleAcaiOrderService } from './on-sale-acai-order.service';
import { OnSaleAcaiOrderController } from './on-sale-acai-order.controller';
import { Additional } from '../additional/entities/additional.entity';
import { OnSaleAcaiAdditional } from './entities/on-sale-acai-additional.entity';
import { OnSaleAcaiOrder } from './entities/on-sale-acai-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OnSaleAcaiOrder, OnSaleAcaiAdditional, Additional])],
  controllers: [OnSaleAcaiOrderController],
  providers: [OnSaleAcaiOrderService],
  exports: [OnSaleAcaiOrderService],
})
export class OnSaleAcaiOrderModule { }
