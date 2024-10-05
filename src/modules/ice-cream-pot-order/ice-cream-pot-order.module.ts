import { Module } from '@nestjs/common';
import { IceCreamPotOrderService } from './ice-cream-pot-order.service';
import { IceCreamPotOrderController } from './ice-cream-pot-order.controller';
import { IceCreamSize } from '../ice-cream-size/entities/ice-cream-size.entity';
import { IceCreamFlavor } from '../ice-cream-flavor/entities/ice-cream-flavor.entity';
import { IceCreamPotOrder } from './entities/ice-cream-pot-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IceCreamPotOrder, IceCreamFlavor, IceCreamSize])],
  controllers: [IceCreamPotOrderController],
  providers: [IceCreamPotOrderService],
  exports: [IceCreamPotOrderService],
})
export class IceCreamPotOrderModule { }
