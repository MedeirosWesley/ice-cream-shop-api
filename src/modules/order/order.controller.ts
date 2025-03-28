import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrinterService } from '../printer/printer.service';
import { OrderDto } from './dto/order.dto';
import { Or } from 'typeorm';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService, private readonly printService: PrinterService) { }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);

    await this.printService.printOrder(OrderDto.fromEntity(await this.orderService.findOne(order.id)));
    return order;
  }

  @Get('sales-summary')
  async getSalesSummary() {
    return await this.orderService.getSalesSummary();
  }

  @Get(':type')
  findAll(@Param('type') type: string) {
    return this.orderService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.orderService.update(id, updateOrderDto);

    await this.printService.printOrder(OrderDto.fromEntity(await this.orderService.findOne(order.id)));
    return order;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
