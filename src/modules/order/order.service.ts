import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
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
import { CreatePopsicleOrderDto } from '../popsicle-order/dto/create-popsicle-order.dto';
import { PopsicleOrderService } from '../popsicle-order/popsicle-order.service';
import { OrderProduct } from './entities/order-product.entity';
import { OrderDto } from './dto/order.dto';

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
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new Order();
    order.clientId = createOrderDto.clientId;
    order.paymentMethod = createOrderDto.paymentMethod;
    order.motorcycleCourierId = createOrderDto.motorcycleCourierId;

    const products = [];

    for (const createProduct of createOrderDto.products) {
      const product = createProduct.product;
      const orderProduct = this.orderProductRepository.create()
      orderProduct.quantity = createProduct.quantity
      orderProduct.observation = createProduct.observation
      orderProduct.productType = product.type;
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
          const popsicle = await this.popsicleService.create(product.details as CreatePopsicleOrderDto);
          orderProduct.popsicle = popsicle;
          products.push(orderProduct);
          break;
        default:
          throw new BadRequestException(`Invalid product type ${product}`);
      }
    }

    order.products = products;

    return this.orderRepository.save(order);
  }

  async findAll() {
    const data = await this.orderRepository.find({
      relations: ['products', 'products.acai', 'products.acai.additionals', 'products.milkShake', 'products.popsicle', 'products.drink', 'products.iceCream', 'products.iceCreamPot', 'motorcycleCourier', 'client'],
    });

    return data.map(order => new OrderDto(order));
  }

  findOne(id: string) {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['products', 'products.acai', 'products.acai.additionals', 'products.milkShake', 'products.popsicle', 'products.drink', 'products.iceCream', 'products.iceCreamPot', 'motorcycleCourier', 'client'],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }

    order.clientId = updateOrderDto.clientId;
    order.paymentMethod = updateOrderDto.paymentMethod;
    order.motorcycleCourierId = updateOrderDto.motorcycleCourierId;

    if (updateOrderDto.products) {
      const products = [];

      for (const createProduct of updateOrderDto.products) {
        const product = createProduct.product;
        const orderProduct = this.orderProductRepository.create()
        orderProduct.quantity = createProduct.quantity
        orderProduct.observation = createProduct.observation
        orderProduct.productType = product.type;
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
            const popsicle = await this.popsicleService.create(product.details as CreatePopsicleOrderDto);
            orderProduct.popsicle = popsicle;
            products.push(orderProduct);
            break;
          default:
            throw new BadRequestException(`Invalid product type ${product}`);
        }
      }

      order.products = products
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
}
