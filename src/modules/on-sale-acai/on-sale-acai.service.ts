import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOnSaleAcaiDto } from './dto/create-on-sale-acai.dto';
import { UpdateOnSaleAcaiDto } from './dto/update-on-sale-acai.dto';
import { OnSaleAcai } from './entities/on-sale-acai.entity';
import { In, Repository } from 'typeorm';
import moment from 'moment';
import { AcaiAdditionalOnSale } from './entities/acai_additional-on-sale.entity';
import { Additional } from '../additional/entities/additional.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderProduct } from '../order/entities/order-product.entity';

@Injectable()
export class OnSaleAcaiService {
  constructor(
    @InjectRepository(OnSaleAcai)
    private readonly onSaleAcaiRepository: Repository<OnSaleAcai>,
    @InjectRepository(AcaiAdditionalOnSale)
    private acaiAdditionalRepository: Repository<AcaiAdditionalOnSale>,
    @InjectRepository(Additional)
    private additionalRepository: Repository<Additional>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
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
    return this.onSaleAcaiRepository.find(
      { relations: ['additionals', 'additionals.additional'] 
          
        }
    );
  }

  /**
   * Promoções mais pedidas nos últimos [days] dias, somando a quantidade dos
   * itens de pedido. Quando há menos de [limit] promoções vendidas no
   * período, completa com as demais cadastradas (orderCount 0).
   *
   * [type] ('delivery' | 'store') restringe o ranking aos pedidos daquele
   * tipo; sem ele, conta todos.
   */
  async findTop(limit = 4, days = 30, type?: string) {
    const since = moment().subtract(days, 'days').startOf('day').toDate();
    const query = this.orderProductRepository
      .createQueryBuilder('op')
      .innerJoin('op.onSaleAcaiOrder', 'saleOrder')
      .innerJoin('op.order', 'order')
      .select('saleOrder.onSaleAcaiId', 'id')
      .addSelect('SUM(op.quantity)', 'total')
      .where('order.date >= :since', { since });
    if (type) {
      // O app grava 'Delivery' / 'Store'.
      query.andWhere('LOWER(order.type) = :type', {
        type: type.toLowerCase(),
      });
    }
    const rows: { id: string; total: string | number }[] =
      await query
        .groupBy('saleOrder.onSaleAcaiId')
        .orderBy('total', 'DESC')
        .limit(limit)
        .getRawMany();

    const counts = new Map(rows.map((row) => [row.id, Number(row.total) || 0]));
    const relations = ['additionals', 'additionals.additional'];

    // Promoção apagada não volta aqui: o find só acha as que ainda existem.
    const ranked = counts.size
      ? await this.onSaleAcaiRepository.find({
          where: { id: In([...counts.keys()]) },
          relations,
        })
      : [];
    ranked.sort((a, b) => counts.get(b.id) - counts.get(a.id));

    let result = ranked;
    if (result.length < limit) {
      const others = (await this.onSaleAcaiRepository.find({ relations }))
        .filter((item) => !counts.has(item.id))
        .slice(0, limit - result.length);
      result = [...result, ...others];
    }

    return result.map((item) => ({
      ...item,
      orderCount: counts.get(item.id) ?? 0,
    }));
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
  const acai = await this.onSaleAcaiRepository.findOne({
    where: { id },
    relations: ['additionals'], 
  });

  if (!acai) {
    throw new NotFoundException('Açaí não encontrado');
  }

  await this.onSaleAcaiRepository.remove(acai);
}
}
