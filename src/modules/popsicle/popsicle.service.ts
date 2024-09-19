import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePopsicleDto } from './dto/create-popsicle.dto';
import { UpdatePopsicleDto } from './dto/update-popsicle.dto';
import { Popsicle } from './entities/popsicle.entity';

@Injectable()
export class PopsicleService {
  constructor(
    @InjectRepository(Popsicle)
    private popsicleRepository: Repository<Popsicle>,
  ) { }

  create(createPopsicleDto: CreatePopsicleDto): Promise<Popsicle> {
    const popsicle = this.popsicleRepository.create(createPopsicleDto);
    return this.popsicleRepository.save(popsicle);
  }

  findAll(): Promise<Popsicle[]> {
    return this.popsicleRepository.find();
  }

  findOne(id: string): Promise<Popsicle> {
    return this.popsicleRepository.findOneBy({ id });
  }

  async update(id: string, updatePopsicleDto: UpdatePopsicleDto): Promise<Popsicle> {
    await this.popsicleRepository.update(id, updatePopsicleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.popsicleRepository.delete(id);
  }
}
