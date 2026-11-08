import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import moment from 'moment';
import { Order } from './entities/order.entity';
import { OrderDto } from './dto/order.dto';
import { ORDER_RELATIONS } from './order-relations';
import { calculateProductsTotal } from './utils/order-total';
import { SalesReportQueryDto } from './dto/sales-report-query.dto';
import {
  SalesByDayDto,
  SalesByPaymentMethodDto,
  SalesByProductTypeDto,
  SalesByTypeDto,
  SalesReportDto,
} from './dto/sales-report.dto';

const NOT_INFORMED = 'not_informed';

@Injectable()
export class SalesReportService {
  private readonly logger = new Logger(SalesReportService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  async getSalesReport(query: SalesReportQueryDto): Promise<SalesReportDto> {
    // Sem parâmetros o relatório é o do dia de hoje.
    const start = (query.startDate ? moment(query.startDate) : moment()).startOf('day');
    const end = (query.endDate ? moment(query.endDate) : moment(start)).endOf('day');

    const startDate = start.toDate();
    const endDate = end.toDate();

    const [summary, byType, byPaymentMethod, byDay] = await Promise.all([
      this.getSummary(startDate, endDate),
      this.getByType(startDate, endDate),
      this.getByPaymentMethod(startDate, endDate),
      this.getByDay(startDate, endDate),
    ]);

    const report: SalesReportDto = {
      period: {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        days: moment(end).startOf('day').diff(start, 'days') + 1,
      },
      summary,
      byType,
      byPaymentMethod,
      byDay,
    };

    if (query.includeProducts === 'true') {
      report.byProductType = await this.getByProductType(startDate, endDate);
    }

    return report;
  }

  private baseQuery(startDate: Date, endDate: Date) {
    return this.orderRepository
      .createQueryBuilder('order')
      .where('order.date BETWEEN :startDate AND :endDate', { startDate, endDate });
  }

  private async getSummary(startDate: Date, endDate: Date) {
    const result = await this.baseQuery(startDate, endDate)
      .select([
        'SUM(order.total) as totalSales',
        'SUM(order.deliveryFee) as totalDeliveryFees',
        'COUNT(order.id) as orderCount',
      ])
      .getRawOne();

    const total = Number(result.totalSales) || 0;
    const orders = Number(result.orderCount) || 0;

    return {
      total,
      orders,
      averageTicket: orders ? total / orders : 0,
      deliveryFees: Number(result.totalDeliveryFees) || 0,
    };
  }

  private async getByType(startDate: Date, endDate: Date): Promise<SalesByTypeDto[]> {
    const rows = await this.baseQuery(startDate, endDate)
      .select([
        'order.type as type',
        'SUM(order.total) as totalSales',
        'COUNT(order.id) as orderCount',
      ])
      .groupBy('order.type')
      .orderBy('totalSales', 'DESC')
      .getRawMany();

    return rows.map(row => {
      const total = Number(row.totalSales) || 0;
      const orders = Number(row.orderCount) || 0;
      return {
        type: row.type ?? NOT_INFORMED,
        total,
        orders,
        averageTicket: orders ? total / orders : 0,
      };
    });
  }

  private async getByPaymentMethod(startDate: Date, endDate: Date): Promise<SalesByPaymentMethodDto[]> {
    const rows = await this.baseQuery(startDate, endDate)
      .select([
        'order.paymentMethod as paymentMethod',
        'SUM(order.total) as totalSales',
        'COUNT(order.id) as orderCount',
      ])
      .groupBy('order.paymentMethod')
      .orderBy('totalSales', 'DESC')
      .getRawMany();

    return rows.map(row => ({
      paymentMethod: row.paymentMethod ?? NOT_INFORMED,
      total: Number(row.totalSales) || 0,
      orders: Number(row.orderCount) || 0,
    }));
  }

  private async getByDay(startDate: Date, endDate: Date): Promise<SalesByDayDto[]> {
    const rows = await this.baseQuery(startDate, endDate)
      .select([
        "strftime('%Y-%m-%d', order.date, 'localtime') as day",
        'SUM(order.total) as totalSales',
        'COUNT(order.id) as orderCount',
        "SUM(CASE WHEN order.type = 'Delivery' THEN order.total ELSE 0 END) as totalDelivery",
        "SUM(CASE WHEN order.type = 'Store' THEN order.total ELSE 0 END) as totalStore",
      ])
      .groupBy("strftime('%Y-%m-%d', order.date, 'localtime')")
      .orderBy("strftime('%Y-%m-%d', order.date, 'localtime')", 'ASC')
      .getRawMany();

    return rows.map(row => ({
      date: row.day,
      total: Number(row.totalSales) || 0,
      orders: Number(row.orderCount) || 0,
      delivery: Number(row.totalDelivery) || 0,
      store: Number(row.totalStore) || 0,
    }));
  }

  /**
   * Faturamento por tipo de produto. Diferente das outras quebras, esta não sai
   * de um SUM em SQL: não existe preço gravado no item, então é preciso hidratar
   * os pedidos e refazer a conta com a mesma lógica do cupom.
   */
  private async getByProductType(startDate: Date, endDate: Date): Promise<SalesByProductTypeDto[]> {
    const orders = await this.orderRepository.find({
      where: { date: Between(startDate, endDate) },
      relations: ORDER_RELATIONS,
    });

    const totals = new Map<string, SalesByProductTypeDto>();

    for (const order of orders) {
      for (const item of new OrderDto(order).products) {
        try {
          const current = totals.get(item.productType) ?? {
            productType: item.productType,
            total: 0,
            quantity: 0,
          };

          current.total += calculateProductsTotal([item]);
          current.quantity += item.quantity ?? 0;

          totals.set(item.productType, current);
        } catch (error) {
          // Item com relação de preço faltando não pode derrubar o relatório inteiro
          this.logger.warn(`Item ${item.id} do pedido ${order.id} ignorado no relatório: ${error.message ?? error}`);
        }
      }
    }

    return [...totals.values()].sort((a, b) => b.total - a.total);
  }
}
