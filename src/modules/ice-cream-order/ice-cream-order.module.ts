import { Module } from '@nestjs/common';
import { IceCreamOrderService } from './ice-cream-order.service';
import { IceCreamOrderController } from './ice-cream-order.controller';
import { IceCreamFlavorOrder } from '../ice-cream-flavor/entities/ice-cream-flavor-order.entity';
import { IceCreamFlavor } from '../ice-cream-flavor/entities/ice-cream-flavor.entity';
import { IceCreamOrder } from './entities/ice-cream-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IceCreamOrder, IceCreamFlavor, IceCreamFlavorOrder])],
  controllers: [IceCreamOrderController],
  providers: [IceCreamOrderService],
  exports: [IceCreamOrderService],
})
export class IceCreamOrderModule { }
