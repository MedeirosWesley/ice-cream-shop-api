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
    private readonly popsicleOrdereRepository: Repository<PopsicleOrder>,
  ) { }

  create(createPopsicleOrderDto: CreatePopsicleOrderDto) {
    const { popsicleId, quantity, withSyrup } = createPopsicleOrderDto;
    const popsicleOrder = this.popsicleOrdereRepository.create({
      popsicleId,
      quantity,
      withSyrup,
    });
    return this.popsicleOrdereRepository.save(popsicleOrder);
  }

  findAll() {
    return this.popsicleOrdereRepository.find({
      relations: ['popsicle'],
    });
  }

  findOne(id: string) {
    return this.popsicleOrdereRepository.findOne({
      where: { id },
      relations: ['popsicle'],
    });
  }

  update(id: string, updatePopsicleOrderDto: UpdatePopsicleOrderDto) {
    return this.popsicleOrdereRepository.update(id, updatePopsicleOrderDto);
  }

  remove(id: string) {
    return this.popsicleOrdereRepository.delete(id);
  }

}
