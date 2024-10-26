import { Injectable } from '@nestjs/common';
import { CreatePopsicleOrderDto } from './dto/create-popsicle-order.dto';
import { UpdatePopsicleOrderDto } from './dto/update-popsicle-order.dto';
import { PopsicleOrder } from './entities/popsicle-order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PopsicleOrderService {
  constructor(
    @InjectRepository(PopsicleOrder)
    private readonly popsicleOrderRepository: Repository<PopsicleOrder>,
  ) { }

  create(createPopsicleOrderDto: CreatePopsicleOrderDto) {
    const { popsicleId, withSyrup } = createPopsicleOrderDto;
    const popsicleOrder = this.popsicleOrderRepository.create({
      popsicleId,
      withSyrup,
    });
    return this.popsicleOrderRepository.save(popsicleOrder);
  }

  findAll() {
    return this.popsicleOrderRepository.find({
      relations: ['popsicle'],
    });
  }

  findOne(id: string) {
    return this.popsicleOrderRepository.findOne({
      where: { id },
      relations: ['popsicle'],
    });
  }

  update(id: string, updatePopsicleOrderDto: UpdatePopsicleOrderDto) {
    return this.popsicleOrderRepository.update(id, updatePopsicleOrderDto);
  }

  remove(id: string) {
    return this.popsicleOrderRepository.delete(id);
  }

}
