import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdditionalDto } from './dto/create-additional.dto';
import { UpdateAdditionalDto } from './dto/update-additional.dto';
import { Additional } from './entities/additional.entity';

@Injectable()
export class AdditionalService {
  constructor(
    @InjectRepository(Additional)
    private additionalRepository: Repository<Additional>,
  ) { }

  create(createAdditionalDto: CreateAdditionalDto): Promise<Additional> {
    const additional = this.additionalRepository.create(createAdditionalDto);
    return this.additionalRepository.save(additional);
  }

  findAll(): Promise<Additional[]> {
    return this.additionalRepository.find();
  }

  findOne(id: string): Promise<Additional> {
    return this.additionalRepository.findOneBy({ id });
  }

  async update(id: string, updateAdditionalDto: UpdateAdditionalDto): Promise<Additional> {
    await this.additionalRepository.update(id, updateAdditionalDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.additionalRepository.delete(id);
  }
}