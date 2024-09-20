import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Acai } from './entities/acai.entity';
import { Repository } from 'typeorm';
import { CreateAcaiDto } from './dto/create-acai.dto';
import { UpdateAcaiDto } from './dto/update-acai.dto';
import { OrderAdditional } from '../order/entities/order-additional.entity';
import { Additional } from '../additional/entities/additional.entity';

@Injectable()
export class AcaiService {
  constructor(
    @InjectRepository(Acai)
    private readonly acaiRepository: Repository<Acai>,
    @InjectRepository(OrderAdditional)
    private orderAdditionalRepository: Repository<OrderAdditional>,
    @InjectRepository(Additional)
    private additionalRepository: Repository<Additional>,
  ) { }

  async create(createAcaiDto: Partial<CreateAcaiDto>): Promise<Acai> {
    const { sizeId, additionals } = createAcaiDto;

    // Criar os orderAdditionals
    const orderAdditionals = await Promise.all(
      additionals.map(async (item) => {
        // Buscar o additional relacionado
        const additional = await this.additionalRepository.findOne({ where: { id: item.additionalId } });

        if (!additional) {
          throw new Error(`Additional with id ${item.additionalId} not found`);
        }

        // Criar o OrderAdditional com o Additional encontrado
        return this.orderAdditionalRepository.create({
          additional, // Aqui associamos o additional
          quantity: item.quantity,
          isSeparated: item.isSeparated,
        });
      }),
    );

    const acai = this.acaiRepository.create({
      sizeId,
      additionals: orderAdditionals,
    });

    return this.acaiRepository.save(acai);
  }

  async findAll(): Promise<Acai[]> {
    return this.acaiRepository.find({
      relations: ['additionals', 'additionals.additional'],
    });
  }

  async findOne(id: string): Promise<Acai> {
    return this.acaiRepository.findOne({
      where: { id },
      relations: ['additionals', 'additionals.additional'],
    });
  }

  async update(id: string, acaiDetails: Partial<UpdateAcaiDto>): Promise<Acai> {
    await this.acaiRepository.update(id, acaiDetails);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.acaiRepository.delete(id);
  }
}