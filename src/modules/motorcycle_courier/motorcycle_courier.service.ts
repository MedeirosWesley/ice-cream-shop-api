import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorcycleCourier } from './entities/motorcycle_courier.entity';
import { CreateMotorcycleCourierDto } from './dto/create-motorcycle_courier.dto';
import { UpdateMotorcycleCourierDto } from './dto/update-motorcycle_courier.dto';


@Injectable()
export class MotorcycleCourierService {
  constructor(
    @InjectRepository(MotorcycleCourier)
    private motorcycleCourierRepository: Repository<MotorcycleCourier>,
  ) { }

  create(createMotorcycleCourierDto: CreateMotorcycleCourierDto): Promise<MotorcycleCourier> {
    const courier = this.motorcycleCourierRepository.create(createMotorcycleCourierDto);
    return this.motorcycleCourierRepository.save(courier);
  }

  findAll(): Promise<MotorcycleCourier[]> {
    return this.motorcycleCourierRepository.find();
  }

  findOne(id: string): Promise<MotorcycleCourier> {
    return this.motorcycleCourierRepository.findOneBy({ id });
  }

  async update(id: string, updateMotorcycleCourierDto: UpdateMotorcycleCourierDto): Promise<MotorcycleCourier> {
    await this.motorcycleCourierRepository.update(id, updateMotorcycleCourierDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.motorcycleCourierRepository.delete(id);
  }
}
