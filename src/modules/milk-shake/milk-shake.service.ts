import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMilkShakeDto } from './dto/create-milk-shake.dto';
import { UpdateMilkShakeDto } from './dto/update-milk-shake.dto';
import { In, Repository } from 'typeorm';
import { MilkShake } from './entities/milk-shake.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Additional } from '../additional/entities/additional.entity';
import { IceCreamFlavor } from '../ice-cream-flavor/entities/ice-cream-flavor.entity';
import { OrderIceCreamFlavor } from '../ice-cream-flavor/entities/order-ice-cream-flavor.entity';
import { MilkShakeAdditional } from './entities/milk-shake-additional.entity';

@Injectable()
export class MilkShakeService {
  constructor(
    @InjectRepository(MilkShake)
    private readonly milkShakeRepository: Repository<MilkShake>,
    @InjectRepository(MilkShakeAdditional)
    private milkShakeAdditionalRepository: Repository<MilkShakeAdditional>,
    @InjectRepository(Additional)
    private additionalRepository: Repository<Additional>,
    @InjectRepository(IceCreamFlavor)
    private iceCreamFlavorRepository: Repository<IceCreamFlavor>,
    @InjectRepository(OrderIceCreamFlavor)
    private orderIceCreamFlavorRepository: Repository<OrderIceCreamFlavor>,
  ) { }

  async create(createMilkShakeDto: Partial<CreateMilkShakeDto>): Promise<MilkShake> {
    const { sizeId, syrupId, additionals, flavors } = createMilkShakeDto;

    const orderAdditionals = await Promise.all(
      additionals.map(async (item) => {
        const additional = await this.additionalRepository.findOne({ where: { id: item.additionalId } });

        if (!additional) {
          throw new BadRequestException(`Additional with id ${item.additionalId} not found`);
        }

        return this.milkShakeAdditionalRepository.create({
          additional,
          quantity: item.quantity,
          isSeparated: item.isSeparated,
        });
      }),
    );

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

    const milkShake = this.milkShakeRepository.create({
      sizeId,
      syrupId,
      additionals: orderAdditionals,
      flavors: orderFlavors,
    });



    return this.milkShakeRepository.save(milkShake);
  }

  async findAll(): Promise<MilkShake[]> {
    return this.milkShakeRepository.find({
      relations: ['additionals', 'additionals.additional', 'flavors', 'flavors.iceCreamFlavor'],
    });
  }

  async findOne(id: string): Promise<MilkShake> {
    return this.milkShakeRepository.findOne({
      where: { id },
      relations: ['additionals', 'additionals.additional', 'flavors', 'flavors.iceCreamFlavor'],
    });
  }

  async update(id: string, milkShakeDetails: Partial<UpdateMilkShakeDto>): Promise<MilkShake> {

    const milkShake = await this.findOne(id);
    const itensExcluidos = milkShake.flavors.map(k => k.iceCreamFlavor.id).filter(oldFlavorId => !milkShakeDetails.additionals.map(newFlavorId => newFlavorId.additionalId).includes(oldFlavorId));
    const novosItens = milkShakeDetails.additionals.map(newFlavorId => newFlavorId.additionalId).filter(item => !milkShake.flavors.map(k => k.iceCreamFlavor.id).includes(item));

    await Promise.all(itensExcluidos.map(async (flavorId) => {
      await this.orderIceCreamFlavorRepository.delete({ milkshake: milkShake, iceCreamFlavor: { id: flavorId } });
    }));

    await Promise.all(novosItens.map(async (flavorId) => {
      const flavor = await this.iceCreamFlavorRepository.findOne({ where: { id: flavorId } });

      if (!flavor) {
        throw new BadRequestException(`Flavor with id ${flavorId} not found`);
      }

      return this.orderIceCreamFlavorRepository.create({
        iceCreamFlavor: flavor,
      });
    }));

    await this.milkShakeRepository.update(id, {
      sizeId: milkShakeDetails.sizeId,
      syrupId: milkShakeDetails.syrupId,
      additionals: milkShakeDetails.additionals,
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.milkShakeRepository.delete(id);
  }
}
