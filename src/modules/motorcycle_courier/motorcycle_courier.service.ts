import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MotorcycleCourier } from './entities/motorcycle_courier.entity';
import { CreateMotorcycleCourierDto } from './dto/create-motorcycle_courier.dto';
import { UpdateMotorcycleCourierDto } from './dto/update-motorcycle_courier.dto';
import { Order } from '../order/entities/order.entity';


@Injectable()
export class MotorcycleCourierService {
  constructor(
    @InjectRepository(MotorcycleCourier)
    private motorcycleCourierRepository: Repository<MotorcycleCourier>,
    private dataSource: DataSource,
  ) { }

  create(createMotorcycleCourierDto: CreateMotorcycleCourierDto): Promise<MotorcycleCourier> {
    const courier = this.motorcycleCourierRepository.create(createMotorcycleCourierDto);
    return this.motorcycleCourierRepository.save(courier);
  }

  findAll(): Promise<MotorcycleCourier[]> {
    return this.motorcycleCourierRepository.find();
  }

  async findOne(id: string): Promise<MotorcycleCourier> {
    const courier = await this.motorcycleCourierRepository.findOneBy({ id });
    if (!courier) {
      throw new NotFoundException('Entregador não encontrado');
    }
    return courier;
  }

  async update(id: string, updateMotorcycleCourierDto: UpdateMotorcycleCourierDto): Promise<MotorcycleCourier> {
    await this.findOne(id);
    await this.motorcycleCourierRepository.update(id, updateMotorcycleCourierDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.dataSource.transaction(async manager => {
      await manager.update(Order, { motorcycleCourierId: id }, { motorcycleCourierId: null });
      await manager.delete(MotorcycleCourier, id);
    });
  }
}
