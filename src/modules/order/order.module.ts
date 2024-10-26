import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrinterModule } from '../printer/printer.module';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcaiModule } from '../acai/acai.module';
import { MilkShakeModule } from '../milk-shake/milk-shake.module';
import { IceCreamOrderModule } from '../ice-cream-order/ice-cream-order.module';
import { IceCreamPotOrderModule } from '../ice-cream-pot-order/ice-cream-pot-order.module';
import { DrinkOrderService } from '../drink-order/drink-order.service';
import { PopsicleOrderModule } from '../popsicle-order/popsicle-order.module';
import { DrinkOrderModule } from '../drink-order/drink-order.module';
import { OrderProduct } from './entities/order-product.entity';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderProduct]), AcaiModule, MilkShakeModule, IceCreamOrderModule, IceCreamPotOrderModule, PopsicleOrderModule, DrinkOrderModule, PrinterModule, ClientModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
