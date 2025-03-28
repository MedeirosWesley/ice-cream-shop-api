import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Between, Like, Or, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
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
import moment from 'moment';

@Injectable()
export class OrderService {
  constructor(
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

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
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
    order.type = getOrderTypeFromString(createOrderDto.type);


    const lastOrder = await this.orderRepository.findOne({
      where: {},
      order: { productIndex: 'DESC' },
    });
    const productIndex = lastOrder ? lastOrder.productIndex + 1 : 1;

    order.productIndex = productIndex;


    const products = [];
    // let total = 0;

    for (const createProduct of createOrderDto.products) {
      const product = createProduct.product;
      const orderProduct = this.orderProductRepository.create()
      orderProduct.quantity = createProduct.quantity
      orderProduct.observation = createProduct.observation
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
    order.total = 0;
    order.products = products;

    return this.orderRepository.save(order);
  }

  async findAll(type: string) {
    const startOfDay = moment().startOf('day').toDate(); // 2025-03-28 00:00:00
    const endOfDay = moment().endOf('day').toDate();


    const data = await this.orderRepository.find({
      where: {
        date: Between(startOfDay, endOfDay),
        type: type
      },
      relations: [
        'products',
        'products.popsicle',
        'products.popsicle.popsicles',
        'products.popsicle.popsicles.popsicle',
        'products.acai',
        'products.acai.additionals',
        'products.milkShake',
        'products.milkShake.flavors',
        'products.milkShake.syrup',
        'products.milkShake.additionals',
        'products.drink',
        'products.iceCream',
        'products.iceCreamPot',
        'motorcycleCourier',
        'client',
        'products.onSaleAcaiOrder',
        'products.onSaleAcaiOrder.onSaleAcai',
        'products.onSaleAcaiOrder.onSaleAcai.additionals',
        'products.onSaleAcaiOrder.additionalExtra',
        'products.onSaleAcaiOrder.additionalExtra.additional',
        'products.onSaleAcaiOrder.additionalRemoved',
        'products.onSaleAcaiOrder.additionalRemoved.additional',
        'products.otherProductOrder',
        'products.otherProductOrder.otherProduct',
      ],
    });
    return data.map(order => new OrderDto(order));
  }

  findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: [
        'products',
        'products.popsicle',
        'products.popsicle.popsicles',
        'products.popsicle.popsicles.popsicle',
        'products.acai',
        'products.acai.additionals',
        'products.milkShake',
        'products.milkShake.flavors',
        'products.milkShake.syrup',
        'products.milkShake.additionals',
        'products.drink',
        'products.iceCream',
        'products.iceCreamPot',
        'motorcycleCourier',
        'client',
        'products.onSaleAcaiOrder',
        'products.onSaleAcaiOrder.onSaleAcai',
        'products.onSaleAcaiOrder.onSaleAcai.additionals',
        'products.onSaleAcaiOrder.additionalExtra',
        'products.onSaleAcaiOrder.additionalExtra.additional',
        'products.onSaleAcaiOrder.additionalRemoved',
        'products.onSaleAcaiOrder.additionalRemoved.additional',
        'products.otherProductOrder',
        'products.otherProductOrder.otherProduct',
      ],
    });
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

    return this.orderRepository.save(order);
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
