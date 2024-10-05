import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateIceCreamPotOrderDto } from './dto/create-ice-cream-pot-order.dto';
import { UpdateIceCreamPotOrderDto } from './dto/update-ice-cream-pot-order.dto';
import { IceCreamPotOrder } from './entities/ice-cream-pot-order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IceCreamFlavor } from '../ice-cream-flavor/entities/ice-cream-flavor.entity';
import { IceCreamSize } from '../ice-cream-size/entities/ice-cream-size.entity';

@Injectable()
export class IceCreamPotOrderService {
  constructor(
    @InjectRepository(IceCreamPotOrder)
    private readonly iceCreamPotOrderRepository: Repository<IceCreamPotOrder>,
    @InjectRepository(IceCreamFlavor)
    private iceCreamFlavorRepository: Repository<IceCreamFlavor>,
    @InjectRepository(IceCreamSize)
    private iceCreamSizeRepository: Repository<IceCreamSize>,
  ) { }

  async create(createIceCreamPotOrderDto: CreateIceCreamPotOrderDto): Promise<IceCreamPotOrder> {
    const { flavorId, sizeId } = createIceCreamPotOrderDto;

    const flavor = await this.iceCreamFlavorRepository.findOne({ where: { id: flavorId } });

    if (!flavor) {
      throw new BadRequestException(`Flavor with id ${flavorId} not found`);
    }

    const size = await this.iceCreamSizeRepository.findOne({ where: { id: sizeId } });

    if (!size) {
      throw new BadRequestException(`Size with id ${sizeId} not found`);
    }

    const iceCreamPotOrder = this.iceCreamPotOrderRepository.create({
      size,
      flavor,
    });

    return this.iceCreamPotOrderRepository.save(iceCreamPotOrder);
  }

  findAll() {
    return this.iceCreamPotOrderRepository.find({
      relations: ['flavor', 'size'],
    });
  }

  findOne(id: string) {
    return this.iceCreamPotOrderRepository.findOne({
      where: { id },
      relations: ['flavor', 'size'],
    });
  }

  async update(id: string, updateIceCreamPotOrderDto: UpdateIceCreamPotOrderDto) {
    const { flavorId, sizeId } = updateIceCreamPotOrderDto;

    const flavor = await this.iceCreamFlavorRepository.findOne({ where: { id: flavorId } });

    if (!flavor) {
      throw new BadRequestException(`Flavor with id ${flavorId} not found`);
    }

    const size = await this.iceCreamSizeRepository.findOne({ where: { id: sizeId } });

    if (!size) {
      throw new BadRequestException(`Size with id ${sizeId} not found`);
    }

    await this.iceCreamPotOrderRepository.update(id, {
      flavor,
      size,
    });

    return this.iceCreamPotOrderRepository.findOne({
      where: { id },
      relations: ['flavor', 'size'],
    });
  }

  remove(id: string) {
    return this.iceCreamPotOrderRepository.delete({ id });
  }

}
