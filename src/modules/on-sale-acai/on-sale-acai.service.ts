import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOnSaleAcaiDto } from './dto/create-on-sale-acai.dto';
import { UpdateOnSaleAcaiDto } from './dto/update-on-sale-acai.dto';
import { OnSaleAcai } from './entities/on-sale-acai.entity';
import { Repository } from 'typeorm';
import { AcaiAdditionalOnSale } from './entities/acai_additional-on-sale.entity';
import { Additional } from '../additional/entities/additional.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OnSaleAcaiService {
  constructor(
    @InjectRepository(OnSaleAcai)
    private readonly onSaleAcaiRepository: Repository<OnSaleAcai>,
    @InjectRepository(AcaiAdditionalOnSale)
    private acaiAdditionalRepository: Repository<AcaiAdditionalOnSale>,
    @InjectRepository(Additional)
    private additionalRepository: Repository<Additional>,
  ) { }

  async create(createOnSaleAcaiDto: CreateOnSaleAcaiDto): Promise<OnSaleAcai> {
    const { sizeId, additionals, quantity } = createOnSaleAcaiDto;

    // Criar os orderAdditionals
    const orderAdditionals = await Promise.all(
      additionals.map(async (item) => {
        // Buscar o additional relacionado
        const additional = await this.additionalRepository.findOne({ where: { id: item } });

        if (!additional) {
          throw new BadRequestException(`Additional with id ${item} not found`);
        }

        // Criar o OrderAdditional com o Additional encontrado
        return this.acaiAdditionalRepository.create({
          additional, // Aqui associamos o additional
        });
      }),
    );

    const onSaleAcai = this.onSaleAcaiRepository.create({
      sizeId,
      additionals: orderAdditionals,
      price: createOnSaleAcaiDto.price,
      quantity: createOnSaleAcaiDto.quantity,
    });

    return this.onSaleAcaiRepository.save(onSaleAcai);
  }

  findAll() {
    return this.onSaleAcaiRepository.find();
  }

  findOne(id: string) {
    return this.onSaleAcaiRepository.findOne({
      where: { id },
      relations: ['additionals', 'additionals.additional'],
    }
    );
  }

  async update(id: string, updateOnSaleAcaiDto: UpdateOnSaleAcaiDto) {
    const { sizeId, additionals } = updateOnSaleAcaiDto;

    // Buscar o onSaleAcai
    const onSaleAcai = await this.onSaleAcaiRepository.findOne({ where: { id } });

    if (!onSaleAcai) {
      throw new BadRequestException(`OnSaleAcai with id ${id} not found`);
    }

    // Atualizar os campos
    if (updateOnSaleAcaiDto.price) onSaleAcai.price = updateOnSaleAcaiDto.price;
    if (updateOnSaleAcaiDto.quantity) onSaleAcai.quantity = updateOnSaleAcaiDto.quantity;
    if (updateOnSaleAcaiDto.sizeId) onSaleAcai.sizeId = sizeId;


    // Atualizar os additionals
    if (additionals) {
      onSaleAcai.additionals = await Promise.all(
        additionals.map(async (item) => {
          // Buscar o additional relacionado
          const additional = await this.additionalRepository.findOne({ where: { id: item } });

          if (!additional) {
            throw new BadRequestException(`Additional with id ${item} not found`);
          }

          // Criar o OrderAdditional com o Additional encontrado
          return this.acaiAdditionalRepository.create({
            additional, // Aqui associamos o additional
          });
        }),
      );
    }

    return this.onSaleAcaiRepository.save(onSaleAcai);
  }

  async remove(id: string) {
    await this.onSaleAcaiRepository.delete(id);
  }
}
