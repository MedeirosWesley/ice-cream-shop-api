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
    return this.popsiclesOrderRepository.find({
      relations: [
        'popsicles', // Relacionamento com PopsicleOrder
        'popsicles.popsicle', // Relacionamento com Popsicle na PopsicleOrder
      ],
    });
  }

  findOne(id: string) {
    return this.popsiclesOrderRepository.findOne({
      where: { id },
      relations: [
        'popsicles', // Relacionamento com PopsicleOrder
        'popsicles.popsicle', // Relacionamento com Popsicle na PopsicleOrder
      ],
    });
  }

  update(id: string, updatePopsiclesOrderDto: UpdatePopsicleOrderDto) {
    return this.popsiclesOrderRepository.update(id, updatePopsiclesOrderDto);
  }

  remove(id: string) {
    return this.popsiclesOrderRepository.delete(id);
  }

}
