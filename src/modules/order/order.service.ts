import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Between, DataSource, In, IsNull, Not, Repository } from 'typeorm';
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
import { OrderPaymentKey } from './entities/order-payment-key.entity';
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
import { SettingsService } from '../settings/settings.service';
import { MotorcycleCourier } from '../motorcycle_courier/entities/motorcycle_courier.entity';
import { EventsService } from '../events/events.service';

const CLIENT_DATE_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly inFlightByKey = new Map<string, Promise<{ order: Order; created: boolean }>>();
  // O TypeORM usa uma única conexão no SQLite: duas transações simultâneas
  // colidem, então as escritas de pagamento com chave rodam uma de cada vez.
  private paymentWrites: Promise<unknown> = Promise.resolve();

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
    private readonly settingsService: SettingsService,
    private readonly events: EventsService,
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

  /**
   * Criação segura para reenvio: a mesma chave sempre resolve para o mesmo
   * pedido, inclusive em requisições simultâneas.
   */
  async createIdempotent(createOrderDto: CreateOrderDto): Promise<{ order: Order; created: boolean }> {
    const result = await this.joinOrCreateByKey(createOrderDto);
    // Fora do caminho de criação de propósito: também precisa valer quando a
    // chave se repete, pois o caixa pode ter marcado pago depois do 1º envio.
    if (createOrderDto.paidInFull) {
      const amountPaid = await this.applyPaidInFull(result.order.id);
      if (amountPaid !== null) {
        result.order.amountPaid = amountPaid;
      }
    }
    return result;
  }

  private joinOrCreateByKey(createOrderDto: CreateOrderDto): Promise<{ order: Order; created: boolean }> {
    const key = createOrderDto.idempotencyKey;
    const running = this.inFlightByKey.get(key);
    if (running) {
      return running.then(({ order }) => ({ order, created: false }));
    }

    const task = this.findOrCreateByKey(createOrderDto).finally(() => {
      this.inFlightByKey.delete(key);
    });
    this.inFlightByKey.set(key, task);
    return task;
  }

  private async findOrCreateByKey(createOrderDto: CreateOrderDto): Promise<{ order: Order; created: boolean }> {
    const key = createOrderDto.idempotencyKey;
    const existing = await this.findByIdempotencyKey(key);
    if (existing) {
      return { order: existing, created: false };
    }

    try {
      return { order: await this.create(createOrderDto), created: true };
    } catch (error) {
      const winner = String(error?.message).includes('UNIQUE')
        ? await this.findByIdempotencyKey(key)
        : null;
      if (winner) {
        return { order: winner, created: false };
      }
      throw error;
    }
  }

  private findByIdempotencyKey(idempotencyKey: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { idempotencyKey },
      relations: ORDER_RELATIONS,
    });
  }

  private serializePaymentWrite<T>(task: () => Promise<T>): Promise<T> {
    const run = this.paymentWrites.then(task);
    this.paymentWrites = run.catch(() => undefined);
    return run;
  }

  /**
   * Quita o pedido: itens pagos e `amountPaid` cobrindo a taxa de entrega.
   * Define valores em vez de somar, então repetir não muda nada. Devolve o
   * novo `amountPaid`, ou null se o pedido já estava quitado.
   */
  private applyPaidInFull(orderId: string): Promise<number | null> {
    return this.serializePaymentWrite(async () => {
      const applied = await this.dataSource.transaction(async manager => {
        const order = await manager.findOne(Order, { where: { id: orderId } });
        if (!order) {
          return null;
        }

        const [{ unpaid }] = await manager.query(
          'SELECT COUNT(*) AS unpaid FROM order_product WHERE orderId = ? AND (isPaid IS NULL OR isPaid = 0)',
          [orderId],
        );
        const current = Number(order.amountPaid) || 0;
        const amountPaid = Math.max(current, Number(order.deliveryFee) || 0);
        if (Number(unpaid) === 0 && amountPaid === current) {
          return null;
        }

        await manager.query(
          'UPDATE order_product SET isPaid = 1 WHERE orderId = ? AND (isPaid IS NULL OR isPaid = 0)',
          [orderId],
        );
        await manager.update(Order, orderId, { amountPaid });
        return { amountPaid, type: order.type };
      });

      if (!applied) {
        return null;
      }
      this.events.orderChanged(applied.type, orderId, 'paid');
      return applied.amountPaid;
    });
  }

  /** Reserva atômica da impressão: só o primeiro a chamar recebe true. */
  async claimPrint(orderId: string): Promise<boolean> {
    const result = await this.orderRepository.update(
      { id: orderId, printClaimedAt: IsNull() },
      { printClaimedAt: new Date() },
    );
    return result.affected === 1;
  }

  /** Hora em que o pedido foi feito no aparelho, se for uma data plausível. */
  private resolveOrderDate(clientCreatedAt?: string): Date {
    const now = new Date();
    const clientDate = clientCreatedAt ? new Date(clientCreatedAt) : null;
    if (
      !clientDate ||
      Number.isNaN(clientDate.getTime()) ||
      clientDate.getTime() > now.getTime() + CLIENT_DATE_FUTURE_TOLERANCE_MS
    ) {
      return now;
    }
    return clientDate;
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new Order();
    order.idempotencyKey = createOrderDto.idempotencyKey ?? null;
    if (createOrderDto.client) {
      order.client = await this.createOrUpdateClient(createOrderDto.client);
    }
    if (createOrderDto.clientName) {
      order.clientName = createOrderDto.clientName;
    }
    order.clientId = createOrderDto.clientId ?? order.client?.id;
    order.paymentMethod = createOrderDto.paymentMethod;
    order.motorcycleCourierId = createOrderDto.motorcycleCourierId;
    order.date = createOrderDto.idempotencyKey
      ? this.resolveOrderDate(createOrderDto.clientCreatedAt)
      : new Date();
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
      orderProduct.toTake = createProduct.toTake ?? false;
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
          throw new BadRequestException(`Invalid product type ${orderProduct.productType}`);
      }
    }
    order.products = products;

    const savedOrder = await this.orderRepository.save(order);

    const result = await this.recalculateTotal(savedOrder.id);
    this.events.orderChanged(order.type, savedOrder.id, 'created');
    if (createOrderDto.client) {
      this.events.catalogChanged('clients');
    }
    return result;
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
    const deliveryFee = getDeliveryFee(
      dto.type,
      dto.isInStorePickup,
      await this.settingsService.getDeliveryFee(),
      dto.deliveryFee,
    );
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

    // Só entra em pedido de entrega que ainda não tem taxa gravada.
    const currentDeliveryFee = await this.settingsService.getDeliveryFee();

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
          const deliveryFee = getDeliveryFee(dto.type, dto.isInStorePickup, currentDeliveryFee, dto.deliveryFee);
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
      throw new NotFoundException('Produto não encontrado');
    }


    const result = await this.orderProductRepository.update(
      product.id,
      { isPaid: true }
    );
    // O item não carrega o pedido aqui: tipo nulo recarrega as duas listas.
    this.events.orderChanged(null, null, 'paid');
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
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    order.status = 'closed';
    order.amountPaid = order.amountPaid;
    const closed = await this.orderRepository.save(order);
    this.events.orderChanged(order.type, id, 'closed');
    return closed;
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
    this.events.orderChanged(order.type, id, 'updated');

    return new OrderDto(await this.findOne(id));
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if (updateOrderDto.clientId != null) {
      order.clientId = updateOrderDto.clientId;
    }
    if (updateOrderDto.clientName != null) {
      order.clientName = updateOrderDto.clientName;
    }
    if (updateOrderDto.paymentMethod != null) {
      order.paymentMethod = updateOrderDto.paymentMethod;
    }
    if (updateOrderDto.motorcycleCourierId != null) {
      order.motorcycleCourierId = updateOrderDto.motorcycleCourierId;
    }
    if (updateOrderDto.amountPaid != null) {
      order.amountPaid = updateOrderDto.amountPaid;
    }
    if (updateOrderDto.status != null) {
      order.status = updateOrderDto.status;
    }
    if (updateOrderDto.type != null) {
      order.type = getOrderTypeFromString(updateOrderDto.type);
    }
    if (updateOrderDto.toTake != null) {
      order.toTake = updateOrderDto.toTake;
    }
    if (updateOrderDto.isInStorePickup != null) {
      order.isInStorePickup = updateOrderDto.isInStorePickup;
    }
    if (updateOrderDto.cashChange != null) {
      order.cashChange = updateOrderDto.cashChange;
    }


    if (updateOrderDto.products) {
      const products = [];

      for (const createProduct of updateOrderDto.products) {
        const product = createProduct.product;
        const orderProduct = this.orderProductRepository.create()
        orderProduct.quantity = createProduct.quantity
        orderProduct.observation = createProduct.observation
        orderProduct.isPaid = createProduct.isPaid ?? false;
        orderProduct.toTake = createProduct.toTake ?? false;
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
            throw new BadRequestException(`Invalid product type ${orderProduct.productType}`);
        }
      }

      order.products = products
    }

    const savedOrder = await this.orderRepository.save(order);

    const result = await this.recalculateTotal(savedOrder.id);
    this.events.orderChanged(savedOrder.type, savedOrder.id, 'updated');
    return result;
  }

  async remove(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    const orderType = order.type;
    const removed = await this.orderRepository.remove(order);
    this.events.orderChanged(orderType, id, 'deleted');
    return removed;
  }

  /**
   * Unifica pedidos: os itens das origens passam a pertencer ao destino (só a
   * FK muda, as linhas não são recriadas), o `amountPaid` das origens é somado
   * no destino e as origens são apagadas. Não imprime.
   */
  async merge(targetId: string, sourceIds: string[]): Promise<Order> {
    const sources = [...new Set(sourceIds)].filter(id => id !== targetId);
    if (!sources.length) {
      throw new BadRequestException('Selecione ao menos um pedido além do destino.');
    }

    await this.dataSource.transaction(async manager => {
      const ids = [targetId, ...sources];
      const orders = await manager.find(Order, { where: { id: In(ids) } });

      if (orders.length !== ids.length) {
        throw new NotFoundException('Um ou mais pedidos não foram encontrados.');
      }

      const target = orders.find(o => o.id === targetId);

      if (orders.some(o => o.status === 'closed')) {
        throw new BadRequestException('Não é possível unificar pedidos já fechados.');
      }
      if (orders.some(o => o.type !== target.type)) {
        throw new BadRequestException('Só é possível unificar pedidos do mesmo tipo.');
      }

      await manager
        .createQueryBuilder()
        .update(OrderProduct)
        .set({ order: { id: targetId } as Order })
        .where('orderId IN (:...sources)', { sources })
        .execute();

      // O SQLite devolve decimal como string; somar sem converter concatenaria.
      const amountPaid =
        Math.round(orders.reduce((sum, o) => sum + (Number(o.amountPaid) || 0), 0) * 100) / 100;
      await manager.update(Order, targetId, { amountPaid });

      await manager.delete(Order, { id: In(sources) });
    });

    const merged = await this.recalculateTotal(targetId);
    this.events.orderChanged(merged?.type ?? null, targetId, 'merged');
    return merged;
  }

  /**
   * Prepara a rota de entrega: carrega os pedidos na ordem pedida, grava o
   * entregador em cada um (se informado) e devolve o nome dele para o cupom.
   */
  async prepareDeliveryRoute(
    orderIds: string[],
    motorcycleCourierId?: string,
  ): Promise<{ orders: Order[]; courierName?: string }> {
    const ids = [...new Set(orderIds)];
    const found = await this.orderRepository.find({
      where: { id: In(ids) },
      relations: ORDER_RELATIONS,
    });
    if (found.length !== ids.length) {
      throw new NotFoundException('Um ou mais pedidos não foram encontrados.');
    }
    const byId = new Map(found.map(o => [o.id, o]));
    const orders = ids.map(id => byId.get(id));

    let courierName: string | undefined;
    if (motorcycleCourierId) {
      const courier = await this.dataSource
        .getRepository(MotorcycleCourier)
        .findOne({ where: { id: motorcycleCourierId } });
      if (!courier) {
        throw new NotFoundException('Entregador não encontrado.');
      }
      courierName = courier.name;
      await this.orderRepository.update({ id: In(ids) }, { motorcycleCourierId });
      for (const order of orders) {
        order.motorcycleCourierId = motorcycleCourierId;
        order.motorcycleCourier = courier;
      }
      this.events.orderChanged(null, null, 'route');
    } else {
      // Sem entregador escolhido, usa o que já estiver nos pedidos.
      courierName = orders.find(o => o.motorcycleCourier)?.motorcycleCourier?.name;
    }

    return { orders, courierName };
  }

  /**
   * Registra um pagamento parcial somando em `amountPaid`. Diferente do PATCH,
   * não reimprime o pedido.
   */
  async addPayment(id: string, amount: number, paymentMethod?: string, idempotencyKey?: string): Promise<Order> {
    const value = Number(amount);
    if (!(value > 0)) {
      throw new BadRequestException('O valor do pagamento precisa ser maior que zero.');
    }

    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if (idempotencyKey) {
      if (await this.applyKeyedPayment(id, value, paymentMethod, idempotencyKey)) {
        this.events.orderChanged(order.type, id, 'paid');
      }
      return await this.findOne(id);
    }

    // O SQLite devolve decimal como string; Number() evita concatenação.
    const amountPaid = Math.round(((Number(order.amountPaid) || 0) + value) * 100) / 100;
    const changes: Partial<Order> = { amountPaid };
    if (paymentMethod && !order.paymentMethod) {
      changes.paymentMethod = paymentMethod;
    }

    await this.orderRepository.update(id, changes);
    this.events.orderChanged(order.type, id, 'paid');
    return await this.findOne(id);
  }

  /** Grava a chave e soma o valor juntos. Devolve false se a chave já existia. */
  private applyKeyedPayment(id: string, value: number, paymentMethod: string | undefined, key: string): Promise<boolean> {
    return this.serializePaymentWrite(async () => {
      // Checado antes da transação: um ROLLBACK nesta conexão única desfaria
      // também o que outra requisição estivesse gravando.
      const repeated = await this.dataSource.manager.findOne(OrderPaymentKey, { where: { key } });
      if (repeated) {
        return false;
      }

      try {
        await this.dataSource.transaction(async manager => {
          await manager.insert(OrderPaymentKey, { key, orderId: id, createdAt: new Date() });
          const order = await manager.findOne(Order, { where: { id } });
          const changes: Partial<Order> = {
            amountPaid: Math.round(((Number(order.amountPaid) || 0) + value) * 100) / 100,
          };
          if (paymentMethod && !order.paymentMethod) {
            changes.paymentMethod = paymentMethod;
          }
          await manager.update(Order, id, changes);
        });
        return true;
      } catch (error) {
        if (String(error?.message).includes('UNIQUE')) {
          return false;
        }
        throw error;
      }
    });
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
    return (await this.clientService.findOne(clientDto.id)) ?? existingClient;
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
        "strftime('%Y-%W', order.date, 'localtime') as week",
        'SUM(order.total) as totalSales',  // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Delivery' THEN order.total ELSE 0 END) as totalDelivery", // Alterado para o campo total
        "SUM(CASE WHEN order.type = 'Store' THEN order.total ELSE 0 END) as totalStore", // Alterado para o campo total
      ])
      .where('order.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy("strftime('%Y-%W', order.date, 'localtime')")
      .orderBy("strftime('%Y-%W', order.date, 'localtime')", 'ASC')
      .getRawMany();

    return result.map(row => ({
      week: row.week,
      total: Number(row.totalSales) || 0,
      delivery: Number(row.totalDelivery) || 0,
      store: Number(row.totalStore) || 0,
    }));
  }

}
