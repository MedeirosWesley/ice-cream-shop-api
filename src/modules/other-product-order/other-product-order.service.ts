import { Injectable } from '@nestjs/common';
import { CreateOtherProductOrderDto } from './dto/create-other-product-order.dto';
import { UpdateOtherProductOrderDto } from './dto/update-other-product-order.dto';
import { OtherProductOrder } from './entities/other-product-order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OtherProductOrderService {
  constructor(
    @InjectRepository(OtherProductOrder)
    private otherProductOrderRepository: Repository<OtherProductOrder>,
  ) { }

  create(createOtherProductOrderDto: CreateOtherProductOrderDto): Promise<OtherProductOrder> {
    const otherProductId = createOtherProductOrderDto.otherProductId;
    const otherProductOrder = this.otherProductOrderRepository.create({ otherProductId });
    return this.otherProductOrderRepository.save(otherProductOrder);
  }

  findAll(): Promise<OtherProductOrder[]> {
    return this.otherProductOrderRepository.find({
      relations: ['otherProduct'],
    });
  }

  findOne(id: string): Promise<OtherProductOrder> {
    return this.otherProductOrderRepository.findOne({
      where: { id },
      relations: ['otherProduct'],
    });
  }

  async update(id: string, updateOtherProductOrderDto: UpdateOtherProductOrderDto): Promise<OtherProductOrder> {
    await this.otherProductOrderRepository.update(id, updateOtherProductOrderDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.otherProductOrderRepository.delete(id);
  }
}
