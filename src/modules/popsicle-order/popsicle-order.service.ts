import { Injectable } from '@nestjs/common';
import { CreatePopsicleOrderDto, CreatePopsiclesOrderDto } from './dto/create-popsicle-order.dto';
import { UpdatePopsicleOrderDto } from './dto/update-popsicle-order.dto';
import { PopsicleOrder } from './entities/popsicle-order.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PopsiclesOrder } from './entities/popsicles-order.entity';

@Injectable()
export class PopsicleOrderService {
  constructor(
    @InjectRepository(PopsicleOrder)
    private readonly popsicleOrderRepository: Repository<PopsicleOrder>,
    @InjectRepository(PopsiclesOrder)
    private readonly popsiclesOrderRepository: Repository<PopsiclesOrder>,

  ) { }

  create(createPopsicleOrderDto: CreatePopsiclesOrderDto) {
    const popsicleOrders = createPopsicleOrderDto.popsicles.map(
      (popsicleOrder) => {
        return this.popsicleOrderRepository.create(popsicleOrder);
      },
    );

    const popsiclesOrder = this.popsiclesOrderRepository.create({
      popsicles: popsicleOrders,
    });

    return this.popsiclesOrderRepository.save(popsiclesOrder);

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
