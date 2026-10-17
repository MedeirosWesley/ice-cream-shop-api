import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Between, DataSource, In, Like, Not, Or, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { AcaiService } from '../acai/acai.service';
import { MilkShakeService } from '../milk-shake/milk-shake.service';
import { IceCreamOrderService } from '../ice-cream-order/ice-cream-order.service';
import { IceCreamPotOrderService } from '../ice-cream-pot-order/ice-cream-pot-order.service';
import { CreateAcaiDto } from '../acai/dto/create-acai.dto';
import { CreateMilkShakeDto } from '../milk-shake/dto/create-milk-shake.dto';
import { CreateIceCreamOrderDto } from '../ice-cream-order/dto/create-ice-cream-order.dto';
import { CreateIceCreamPotOrderDto } from '../ice-cream-pot-order/dto/create-ice-cream-pot-order.dto';
import { DrinkOrderService } from '../drink-order/drink-order.service';
import { CreateDrinkOrderDto } from '../drink-order/dto/create-drink-order.dto';
import { CreatePopsicleOrderDto, CreatePopsiclesOrderDto } from '../popsicle-order/dto/create-popsicle-order.dto';
import { PopsicleOrderService } from '../popsicle-order/popsicle-order.service';
import { OrderProduct } from './entities/order-product.entity';
import { OrderDto } from './dto/order.dto';
import { OrderStatus } from './enums/order-status';
import { ClientService } from '../client/client.service';
import { getOrderTypeFromString } from './enums/order-type';
import { OnSaleAcaiOrderService } from '../on-sale-acai-order/on-sale-acai-order.service';
import { CreateOnSaleAcaiOrderDto } from '../on-sale-acai-order/dto/create-on-sale-acai-order.dto';
import { OtherProductOrderService } from '../other-product-order/other-product-order.service';
import { CreateOtherProductOrderDto } from '../other-product-order/dto/create-other-product-order.dto';
import { CreateClientDto } from '../client/dto/create-client.dto';
import { Client } from '../client/entities/client.entity';
import { calculateProductsTotal, getDeliveryFee } from './utils/order-total';
import { ORDER_RELATIONS } from './order-relations';
import moment from 'moment';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    private readonly acaiService: AcaiService,
    private readonly milkShakeService: MilkShakeService,
    private readonly popsicleService: PopsicleOrderService,
    private readonly drinkService: DrinkOrderService,
    private readonly iceCreamService: IceCreamOrderService,
    private readonly iceCreamPotService: IceCreamPotOrderService,
    private readonly clientService: ClientService,
    private readonly onSaleAcaiOrderService: OnSaleAcaiOrderService,
    private readonly outherProductOrderService: OtherProductOrderService,
  ) { }

  // Esse método roda automaticamente quando o NestJS sobe
  async onModuleInit() {
    await this.dataSource.query(`
        CREATE TRIGGER IF NOT EXISTS generate_order_index
        AFTER INSERT ON "order"
        BEGIN
            UPDATE "order" 
            SET productIndex = (
                SELECT IFNULL(MAX(productIndex), 0) + 1 
                FROM "order" 
                WHERE id != NEW.id
            )
            WHERE id = NEW.id;
        END;
    `);
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {


      const order = new Order();
      if (createOrderDto.client) {
        order.client = await this.createOrUpdateClient(createOrderDto.client);
      }
      if (createOrderDto.clientName) {
        order.clientName = createOrderDto.clientName;
      }
      order.clientId = createOrderDto.clientId ?? order.client?.id;
      order.paymentMethod = createOrderDto.paymentMethod;
      order.motorcycleCourierId = createOrderDto.motorcycleCourierId;
      order.date = new Date();
      order.status = OrderStatus.Pending;
      order.amountPaid = 0;
      order.cashChange = createOrderDto.cashChange;
      order.toTake = createOrderDto.toTake;
      order.isInStorePickup = createOrderDto.isInStorePickup;
      order.type = getOrderTypeFromString(createOrderDto.type);


      // const lastOrder = await this.orderRepository.findOne({
      //   where: {},
      //   order: { productIndex: 'DESC' },
      // });
      // const productIndex = lastOrder ? lastOrder.productIndex + 1 : 1;

      order.productIndex = 0; // Será atualizado pelo trigger do banco de dados


      const products = [];
      // let total = 0;

      for (const createProduct of createOrderDto.products) {
        const product = createProduct.product;
        const orderProduct = this.orderProductRepository.create()
        orderProduct.quantity = createProduct.quantity
        orderProduct.observation = createProduct.observation
        orderProduct.isPaid = createProduct.isPaid ?? false;
        orderProduct.productType = product.type;
        orderProduct.status = createProduct.status;
        switch (product.type) {
          case 'acai':
            const acai = await this.acaiService.create(product.details as CreateAcaiDto)
            orderProduct.acai = acai
            products.push(orderProduct);

            break;
          case 'milk_shake':
            const milkShake = await this.milkShakeService.create(product.details as CreateMilkShakeDto);
            orderProduct.milkShake = milkShake;
            products.push(orderProduct);

            break;
          case 'drink':
            const drink = await this.drinkService.create(product.details as CreateDrinkOrderDto);
            orderProduct.drink = drink;
            products.push(orderProduct);
            break;
          case 'ice_cream':
            const iceCream = await this.iceCreamService.create(product.details as CreateIceCreamOrderDto);
            orderProduct.iceCream = iceCream;
            products.push(orderProduct);
            break;
          case 'ice_cream_pot':
            const IceCreamPot = await this.iceCreamPotService.create(product.details as CreateIceCreamPotOrderDto);
            orderProduct.iceCreamPot = IceCreamPot;
            products.push(orderProduct);
            break;
          case 'popsicle':
            const popsicle = await this.popsicleService.create(product.details as CreatePopsiclesOrderDto);
            orderProduct.popsicle = popsicle;
            products.push(orderProduct);
            break;
          case 'on_sale_acai':
            const onSaleAcai = await this.onSaleAcaiOrderService.create(product.details as CreateOnSaleAcaiOrderDto);
            orderProduct.onSaleAcaiOrder = onSaleAcai;
            products.push(orderProduct);
            break;
          case 'other_product':
            const otherProduct = await this.outherProductOrderService.create(product.details as CreateOtherProductOrderDto);
            orderProduct.otherProductOrder = otherProduct;
            products.push(orderProduct);
            break;
          default:
            throw new BadRequestException(`Invalid product type ${product}`);
        }
      }
      order.products = products;

      const savedOrder = await this.orderRepository.save(order);

      return await this.recalculateTotal(savedOrder.id);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Recalcula e persiste o total do pedido.
   * Precisa refazer o findOne porque as entidades devolvidas pelos sub-serviços
   * (acai, drink, popsicle...) não trazem as relações de preço carregadas.
   */
  async recalculateTotal(id: string): Promise<Order> {
    try {
      return await this.applyOrderTotals(id);
    } catch (error) {
      // Um erro de precificação não pode fazer o pedido já salvo se perder
      console.log('Erro ao calcular o total do pedido:', error);
      return await this.findOne(id);
    }
  }

  /** Versão que propaga o erro — usada pelo backfill, que precisa contabilizar falhas. */
  private async applyOrderTotals(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (!order) {
      return null;
    }

    const dto = OrderDto.fromEntity(order);
    const deliveryFee = getDeliveryFee(dto.type, dto.isInStorePickup);
    const total = calculateProductsTotal(dto.products) + deliveryFee;

    await this.orderRepository.update(id, { total, deliveryFee });

    order.total = total;
    order.deliveryFee = deliveryFee;
    return order;
  }

  /**
   * Backfill: recalcula o total de todos os pedidos já existentes.
   *
   * Trabalha em lote de propósito: um findOne por pedido dispararia ~25 queries
   * de relação cada um. Aqui cada lote é hidratado de uma vez (relationLoadStrategy
   * 'query', que busca cada relação com um IN em vez de um JOIN cartesiano) e os
   * UPDATEs vão todos dentro de uma transação — no SQLite isso troca N commits
   * em disco por um só.
   *
   * Sem datas processa o histórico inteiro; com `startDate`/`endDate` processa
   * só o intervalo, para dar para conferir o resultado período a período.
   *
   * ATENÇÃO: usa os preços ATUAIS dos produtos — pedidos antigos são
   * reavaliados a preço de hoje. Rode com backup do banco e com a API parada.
   */
  async recalculateAllTotals(options: {
    startDate?: Date;
    endDate?: Date;
    batchSize?: number;
    onProgress?: (processed: number, totalOrders: number) => void;
  } = {}): Promise<{
    processed: number;
    updated: number;
    failed: number;
    sum: number;
    emptyOrders: number;
  }> {
    const { startDate, endDate, batchSize = 200, onProgress } = options;

    const idsQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('order.id', 'id')
      .orderBy('order.date', 'ASC');

    if (startDate && endDate) {
      idsQuery.where('order.date BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const rows = await idsQuery.getRawMany();

    const ids: string[] = rows.map(row => row.id);

    let processed = 0;
    let updated = 0;
    let failed = 0;
    let sum = 0;
    let emptyOrders = 0;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);

      const orders = await this.orderRepository.find({
        where: { id: In(batchIds) },
        relations: ORDER_RELATIONS,
        relationLoadStrategy: 'query',
      });

      const changes: { id: string; total: number; deliveryFee: number }[] = [];

      for (const order of orders) {
        try {
          const dto = OrderDto.fromEntity(order);
          const deliveryFee = getDeliveryFee(dto.type, dto.isInStorePickup);
          const total = calculateProductsTotal(dto.products) + deliveryFee;

          // Pedido sem nenhum item zera legitimamente — não é falha de cálculo.
          if (dto.products.length === 0) {
            emptyOrders++;
          }

          changes.push({ id: order.id, total, deliveryFee });
          sum += total;
        } catch (error) {
          failed++;
          console.log(`Falha ao recalcular o pedido ${order.id}:`, error);
        }
      }

      if (changes.length) {
        await this.dataSource.transaction(async manager => {
          for (const change of changes) {
            await manager.update(Order, change.id, {
              total: change.total,
              deliveryFee: change.deliveryFee,
            });
          }
        });
      }

      updated += changes.length;
      processed += batchIds.length;

      if (onProgress) {
        onProgress(processed, ids.length);
      }
    }

    return { processed, updated, failed, sum, emptyOrders };
  }

  async findAll(type: string) {
    // const startOfDay = moment().subtract(4, 'days').startOf('day').toDate();  // Início do dia anterior
    // const endOfDay = moment().subtract(4, 'days').endOf('day').toDate();  // Fim do dia anterior
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();


    const data = await this.orderRepository.find({
      where: {
        date: Between(startOfDay, endOfDay),
        status: Not('closed'),
        type: type
      },
      relations: ORDER_RELATIONS,
    });
    return data.map(order => new OrderDto(order));
  }

  async setPaidProduct(productId: string) {
    const product = await this.orderProductRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Produto não encontrado');
    }


    const result = await this.orderProductRepository.update(
      product.id,
      { isPaid: true }
    );
    return result;
  }

  findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ORDER_RELATIONS,
    });
  }

  async close(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    order.status = 'closed';
    order.amountPaid = order.amountPaid;
    return this.orderRepository.save(order);
  }

  /// Só o nome exibido do pedido. Não toca no cadastro em `client`: a correção
  /// vale para este pedido, não para o histórico do cliente.
  async updateClientName(id: string, clientName: string) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    order.clientName = clientName.trim();
    await this.orderRepository.save(order);

    return new OrderDto(await this.findOne(id));
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    if (updateOrderDto.clientId !== null) {
      order.clientId = updateOrderDto.clientId;
    }
    if (updateOrderDto.clientName !== null) {
      order.clientName = updateOrderDto.clientName;
    }
    if (updateOrderDto.paymentMethod !== null) {
      order.paymentMethod = updateOrderDto.paymentMethod;
    }
    if (updateOrderDto.motorcycleCourierId !== null) {
      order.motorcycleCourierId = updateOrderDto.motorcycleCourierId;
    }
    if (updateOrderDto.amountPaid !== null) {
      order.amountPaid = updateOrderDto.amountPaid;
    }
    if (updateOrderDto.status !== null) {
      order.status = updateOrderDto.status;
    }
    if (updateOrderDto.type !== null) {
      order.type = getOrderTypeFromString(updateOrderDto.type);
    }
    if (updateOrderDto.toTake !== null) {
      order.toTake = updateOrderDto.toTake;
    }
    if (updateOrderDto.isInStorePickup !== null) {
      order.isInStorePickup = updateOrderDto.isInStorePickup;
    }
    if (updateOrderDto.cashChange !== null) {
      order.cashChange = updateOrderDto.cashChange;
    }


    try {


      if (updateOrderDto.products) {
        const products = [];

        for (const createProduct of updateOrderDto.products) {
          const product = createProduct.product;
          const orderProduct = this.orderProductRepository.create()
          orderProduct.quantity = createProduct.quantity
          orderProduct.observation = createProduct.observation
          orderProduct.isPaid = createProduct.isPaid ?? false;
          orderProduct.productType = product.type;
          orderProduct.status = createProduct.status;
          switch (product.type) {
            case 'acai':
              const acai = await this.acaiService.create(product.details as CreateAcaiDto)
              orderProduct.acai = acai
              products.push(orderProduct);
              break;
            case 'milk_shake':
              const milkShake = await this.milkShakeService.create(product.details as CreateMilkShakeDto);
              orderProduct.milkShake = milkShake;
              products.push(orderProduct);
              break;
            case 'drink':
              const drink = await this.drinkService.create(product.details as CreateDrinkOrderDto);
              orderProduct.drink = drink;
              products.push(orderProduct);
              break;
            case 'ice_cream':
              const iceCream = await this.iceCreamService.create(product.details as CreateIceCreamOrderDto);
              orderProduct.iceCream = iceCream;
              products.push(orderProduct);
              break;
            case 'ice_cream_pot':
              const IceCreamPot = await this.iceCreamPotService.create(product.details as CreateIceCreamPotOrderDto);
              orderProduct.iceCreamPot = IceCreamPot;
              products.push(orderProduct);
              break;
            case 'popsicle':
              const popsicle = await this.popsicleService.create(product.details as CreatePopsiclesOrderDto);
              orderProduct.popsicle = popsicle;
              products.push(orderProduct);
              break;
            case 'on_sale_acai':
              const onSaleAcai = await this.onSaleAcaiOrderService.create(product.details as CreateOnSaleAcaiOrderDto);
              orderProduct.onSaleAcaiOrder = onSaleAcai;
              products.push(orderProduct);
              break;
            case 'other_product':
              const otherProduct = await this.outherProductOrderService.create(product.details as CreateOtherProductOrderDto);
              orderProduct.otherProductOrder = otherProduct;
              products.push(orderProduct);
              break;
            default:
              throw new BadRequestException(`Invalid product type ${product}`);
          }
        }

        order.products = products
      }

    } catch (error) {

      console.log(error);
    }

    const savedOrder = await this.orderRepository.save(order);

    return await this.recalculateTotal(savedOrder.id);
  }

  async remove(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return this.orderRepository.remove(order);
  }

  async createOrUpdateClient(clientDto: CreateClientDto): Promise<Client> {
    if (!clientDto || !clientDto.id) {
      return await this.clientService.create(clientDto);
    }

    const existingClient = await this.clientService.findOne(clientDto.id);

    if (!existingClient) {
      return this.clientService.create(clientDto);
    }

    await this.clientService.update(clientDto.id, clientDto);
    return existingClient;
  }

  async getSalesSummary() {
    const today = moment().startOf('day').toDate();  // Considerando o timestamp com hora zerada
    const last7Days = moment().subtract(7, 'days').startOf('day').toDate();
    const startOfMonth = moment().startOf('month').toDate();
    const sixWeeksAgo = moment().subtract(6, 'weeks').startOf('isoWeek').toDate();

    // Total de vendas do dia
    const dailySales = await this.getSalesByExactDate(today);

    // Total de vendas dos últimos 7 dias
    const weeklySales = await this.getSalesByDateRange(last7Days, today);

    // Total de vendas do mês
    const monthlySales = await this.getSalesByDateRange(startOfMonth, today);

    // Vendas das últimas 6 semanas, agrupadas por semana
    const last6WeeksSales = await this.getWeeklySales(sixWeeksAgo, today);

    return {
      dailySales,
      weeklySales,
      monthlySales,
      last6WeeksSales,
    };
  }

  private async getSalesByExactDate(date: Date) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'SUM(order.total) as totalSales',  // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Delivery' THEN order.total ELSE 0 END) as totalDelivery", // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Store' THEN order.total ELSE 0 END) as totalStore", // Alterado para o campo total
      ])
      .where('order.date >= :date AND order.date < :nextDay', {
        date,
        nextDay: moment(date).add(1, 'day').toDate(),
      })
      .getRawOne();

    return {
      total: Number(result.totalSales) || 0,
      delivery: Number(result.totalDelivery) || 0,
      store: Number(result.totalStore) || 0,
    };
  }

  private async getSalesByDateRange(startDate: Date, endDate: Date) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'SUM(order.total) as totalSales', // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Delivery' THEN order.total ELSE 0 END) as totalDelivery", // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Store' THEN order.total ELSE 0 END) as totalStore", // Alterado para o campo total
      ])
      .where('order.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return {
      total: Number(result.totalSales) || 0,
      delivery: Number(result.totalDelivery) || 0,
      store: Number(result.totalStore) || 0,
    };
  }


  private async getWeeklySales(startDate: Date, endDate: Date) {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        "strftime('%Y-%W', order.date) as week",
        'SUM(order.total) as totalSales',  // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Delivery' THEN order.total ELSE 0 END) as totalDelivery", // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Store' THEN order.total ELSE 0 END) as totalStore", // Alterado para o campo total
      ])
      .where('order.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy("strftime('%Y-%W', order.date)")
      .orderBy("strftime('%Y-%W', order.date)", 'ASC')
      .getRawMany();

    return result.map(row => ({
      week: row.week,
      total: Number(row.totalSales) || 0,
      delivery: Number(row.totalDelivery) || 0,
      store: Number(row.totalStore) || 0,
    }));
  }

}
