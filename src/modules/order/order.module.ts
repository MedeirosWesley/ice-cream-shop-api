import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrinterModule } from '../printer/printer.module';

@Module({
  imports: [PrinterModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule { }
