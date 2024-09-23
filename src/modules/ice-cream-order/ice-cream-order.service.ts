import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateIceCreamOrderDto } from './dto/create-ice-cream-order.dto';
import { UpdateIceCreamOrderDto } from './dto/update-ice-cream-order.dto';
import { IceCreamOrder } from './entities/ice-cream-order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IceCreamFlavor } from '../ice-cream-flavor/entities/ice-cream-flavor.entity';
import { IceCreamFlavorOrder } from '../ice-cream-flavor/entities/ice-cream-flavor-order.entity';

@Injectable()
export class IceCreamOrderService {
  constructor(
    @InjectRepository(IceCreamOrder)
    private readonly iceCreamOrderRepository: Repository<IceCreamOrder>,
    @InjectRepository(IceCreamFlavor)
    private iceCreamFlavorRepository: Repository<IceCreamFlavor>,
    @InjectRepository(IceCreamFlavorOrder)
    private orderIceCreamFlavorRepository: Repository<IceCreamFlavorOrder>,
  ) { }

  async create(createIceCreamOrderDto: CreateIceCreamOrderDto): Promise<IceCreamOrder> {
    const { flavors, price } = createIceCreamOrderDto;



    const orderFlavors = await Promise.all(
      flavors.map(async (flavorId) => {
        const flavor = await this.iceCreamFlavorRepository.findOne({ where: { id: flavorId } });

        if (!flavor) {
          throw new BadRequestException(`Flavor with id ${flavorId} not found`);
        }

        return this.orderIceCreamFlavorRepository.create({
          iceCreamFlavor: flavor,
        });
      }),);

    const iceCreamOrder = this.iceCreamOrderRepository.create({
      price: price,
      flavors: orderFlavors,
    });

    return this.iceCreamOrderRepository.save(iceCreamOrder);
  }

  findAll() {
    return this.iceCreamOrderRepository.find({
      relations: ['flavors', 'flavors.iceCreamFlavor'],
    });
  }

  findOne(id: string) {
    return this.iceCreamOrderRepository.findOne({
      where: { id },
      relations: ['flavors', 'flavors.iceCreamFlavor'],
    });
  }

  async update(id: string, updateIceCreamOrderDto: UpdateIceCreamOrderDto) {

    const iceCreamOrder = await this.findOne(id);
    const excludedItems = iceCreamOrder.flavors.map(k => k.iceCreamFlavor.id).filter(oldFlavorId => !updateIceCreamOrderDto.flavors.includes(oldFlavorId));
    const newItems = updateIceCreamOrderDto.flavors.filter(item => !iceCreamOrder.flavors.map(k => k.iceCreamFlavor.id).includes(item));

    await Promise.all(excludedItems.map(async (flavorId) => {
      await this.orderIceCreamFlavorRepository.delete({ iceCreamOrder: iceCreamOrder, iceCreamFlavor: { id: flavorId } });
    }));

    await Promise.all(newItems.map(async (flavorId) => {
      const flavor = await this.iceCreamFlavorRepository.findOne({ where: { id: flavorId } });

      if (!flavor) {
        throw new BadRequestException(`Flavor with id ${flavorId} not found`);
      }

      return this.orderIceCreamFlavorRepository.create({
        iceCreamFlavor: flavor,
      });
    }));

    this.iceCreamOrderRepository.update(id, { price: updateIceCreamOrderDto.price });

    return this.iceCreamOrderRepository.findOne({
      where: { id },
      relations: ['flavors'],
    });
  }

  remove(id: string) {
    return this.iceCreamOrderRepository.delete(id);
  }
}


