import { Module } from '@nestjs/common';
import { DrinkOrderService } from './drink-order.service';
import { DrinkOrderController } from './drink-order.controller';
import { DrinkOrder } from './entities/drink-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DrinkOrder])],
  controllers: [DrinkOrderController],
  providers: [DrinkOrderService],
  exports: [DrinkOrderService],
})
export class DrinkOrderModule { }
