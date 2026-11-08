import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderClientNameDto } from './dto/update-order-client-name.dto';
import { PrinterService } from '../printer/printer.service';
import { OrderDto } from './dto/order.dto';
import { SalesReportService } from './sales-report.service';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import { MergeOrdersDto } from './dto/merge-orders.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { PrintRouteDto } from './dto/print-route.dto';

@Controller('order')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly printService: PrinterService,
    private readonly salesReportService: SalesReportService,
  ) { }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    if (createOrderDto.idempotencyKey) {
      return this.createIdempotent(createOrderDto);
    }

    const order = await this.orderService.create(createOrderDto);

    await this.printService.printOrder(OrderDto.fromEntity(await this.orderService.findOne(order.id)), false);
    return order;
  }

  /**
   * Pedido com chave pode chegar repetido: devolve sempre o mesmo pedido e
   * imprime no máximo uma vez. Falha de impressão não falha o pedido, que
   * continua reimprimível por GET /order/:id/print. `printed` diz se esta
   * requisição imprimiu.
   */
  private async createIdempotent(createOrderDto: CreateOrderDto) {
    const { order } = await this.orderService.createIdempotent(createOrderDto);

    let printed = false;
    if (!createOrderDto.skipPrint && await this.orderService.claimPrint(order.id)) {
      try {
        await this.printService.printOrder(OrderDto.fromEntity(await this.orderService.findOne(order.id)), false);
        printed = true;
      } catch (error) {
        this.logger.error(`Falha ao imprimir o pedido ${order.id}`, error?.stack ?? error);
      }
    }

    return { ...order, printed };
  }

  // Rota fixa: declarada antes das rotas com parâmetro para não ser capturada
  // por nenhuma delas. Não imprime.
  @Post('merge')
  merge(@Body() mergeOrdersDto: MergeOrdersDto) {
    return this.orderService.merge(mergeOrdersDto.targetId, mergeOrdersDto.sourceIds);
  }

  // Rota fixa, antes das rotas com parâmetro. Imprime a rota de entrega
  // agrupada por bairro e grava o entregador nos pedidos.
  @Post('route/print')
  async printRoute(@Body() printRouteDto: PrintRouteDto) {
    const { orders, courierName } = await this.orderService.prepareDeliveryRoute(
      printRouteDto.orderIds,
      printRouteDto.motorcycleCourierId,
    );
    await this.printService.printDeliveryRoute(orders, courierName);
    return { printed: orders.length };
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

  // Também precisa vir antes de @Get(':type'). A rota antiga @Get(':id') nunca
  // era alcançada, porque o ':type' capturava qualquer valor.
  @Get('by-id/:id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  @Get(':type')
  findAll(@Param('type') type: string) {
    return this.orderService.findAll(type);
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

  // Pagamento parcial: soma em amountPaid. Não usa o @Patch(':id') porque
  // aquele reimprime o pedido.
  @Post(':id/payment')
  addPayment(@Param('id') id: string, @Body() addPaymentDto: AddPaymentDto) {
    return this.orderService.addPayment(id, addPaymentDto.amount, addPaymentDto.paymentMethod, addPaymentDto.idempotencyKey);
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
