import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderClientNameDto } from './dto/update-order-client-name.dto';
import { PrinterService } from '../printer/printer.service';
import { OrderDto } from './dto/order.dto';
import { Or } from 'typeorm';
import { SalesReportService } from './sales-report.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly printService: PrinterService,
    private readonly salesReportService: SalesReportService,
  ) { }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.create(createOrderDto);

    await this.printService.printOrder(OrderDto.fromEntity(await this.orderService.findOne(order.id)), false);
    return order;
  }

  @Get('sales-summary')
  async getSalesSummary() {
    return await this.orderService.getSalesSummary();
  }

  // Precisa vir antes de @Get(':type'), senão o findAll engole a rota.
  @Get('sales-report')
  async getSalesReport(@Query() query: SalesReportQueryDto) {
    return await this.salesReportService.getSalesReport(query);
  }

  @Get(':type')
  findAll(@Param('type') type: string) {
    return this.orderService.findAll(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Get(':id/print')
  async print(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    await this.printService.printOrder(OrderDto.fromEntity(order), true);
    return order;
  }

  @Post('mark_product_paid')
  async markProductPaid(@Body('productId') productId: string) {
    return this.orderService.setPaidProduct(productId);
  }

  @Post(':id/close')
  async close(@Param('id') id: string) {
    const order = await this.orderService.close(id);

    return order;
  }

  // Correção do nome do cliente no caixa. Não passa pelo @Patch(':id') de
  // propósito: aquele reimprime o pedido, e trocar um nome errado não deve
  // gastar um cupom.
  @Patch(':id/client-name')
  updateClientName(
    @Param('id') id: string,
    @Body() updateOrderClientNameDto: UpdateOrderClientNameDto,
  ) {
    return this.orderService.updateClientName(id, updateOrderClientNameDto.clientName);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.orderService.update(id, updateOrderDto);

    await this.printService.printOrder(OrderDto.fromEntity(await this.orderService.findOne(order.id)), false);
    return order;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
