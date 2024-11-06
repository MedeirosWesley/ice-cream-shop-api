import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOnSaleAcaiOrderDto } from './dto/create-on-sale-acai-order.dto';
import { UpdateOnSaleAcaiOrderDto } from './dto/update-on-sale-acai-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Additional } from '../additional/entities/additional.entity';
import { OnSaleAcaiAdditional } from './entities/on-sale-acai-additional.entity';
import { OnSaleAcaiOrder } from './entities/on-sale-acai-order.entity';

@Injectable()
export class OnSaleAcaiOrderService {
  constructor(
    @InjectRepository(OnSaleAcaiOrder)
    private readonly onSaleAcaiRepository: Repository<OnSaleAcaiOrder>,
    @InjectRepository(OnSaleAcaiAdditional)
    private acaiAdditionalRepository: Repository<OnSaleAcaiAdditional>,
    @InjectRepository(Additional)
    private additionalRepository: Repository<Additional>,
  ) { }

  async create(createOnSaleAcaiOrderDto: CreateOnSaleAcaiOrderDto): Promise<OnSaleAcaiOrder> {
    const { onSaleAcaiId, additionalExtras, additionalRemoved } = createOnSaleAcaiOrderDto;


    const orderAdditionals = await Promise.all(
      additionalExtras.map(async (item) => {
        const additional = await this.additionalRepository.findOne({ where: { id: item.additionalId } });

        if (!additional) {
          throw new BadRequestException(`Additional with id ${item.additionalId} not found`);
        }
        return this.acaiAdditionalRepository.create({
          additional,
          quantity: item.quantity,
          isSeparated: item.isSeparated,
        });
      }),
    );

    const orderAdditionalsRemoved = await Promise.all(
      additionalRemoved.map(async (item) => {
        const additional = await this.additionalRepository.findOne({ where: { id: item.additionalId } });

        if (!additional) {
          throw new BadRequestException(`Additional with id ${item.additionalId} not found`);
        }

        return this.acaiAdditionalRepository.create({
          additional,
          quantity: item.quantity,
          isSeparated: item.isSeparated,
          isRemoved: true,
        });
      }),
    );

    const onSaleAcaiOrder = this.onSaleAcaiRepository.create({
      onSaleAcaiId,
      additionalExtra: orderAdditionals,
      additionalRemoved: orderAdditionalsRemoved,
    });

    return this.onSaleAcaiRepository.save(onSaleAcaiOrder);
  }

  findAll() {
    return this.onSaleAcaiRepository.find({
      relations: ['additionalExtra', 'additionalRemoved', 'additionalExtra.additional', 'additionalRemoved.additional'],
    });
  }

  findOne(id: string) {
    return this.onSaleAcaiRepository.findOne({
      where: { id },
      relations: ['additionalExtra', 'additionalRemoved', 'additionalExtra.additional', 'additionalRemoved.additional'],
    });
  }

  update(id: string, updateOnSaleAcaiOrderDto: UpdateOnSaleAcaiOrderDto) {
    return this.onSaleAcaiRepository.update(id, updateOnSaleAcaiOrderDto);
  }

  remove(id: string) {
    return this.onSaleAcaiRepository.delete(id);
  }
}
