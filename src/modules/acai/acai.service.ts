import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Acai } from './entities/acai.entity';
import { Repository } from 'typeorm';
import { CreateAcaiDto } from './dto/create-acai.dto';
import { UpdateAcaiDto } from './dto/update-acai.dto';

@Injectable()
export class AcaiService {
  constructor(
    @InjectRepository(Acai)
    private readonly acaiRepository: Repository<Acai>,
  ) { }

  async create(acaiDetails: Partial<CreateAcaiDto>): Promise<Acai> {
    const acai = this.acaiRepository.create(acaiDetails);
    return this.acaiRepository.save(acai);
  }

  async findAll(): Promise<Acai[]> {
    return this.acaiRepository.find({
      relations: ['orderAdditionals'],
    });
  }

  async findOne(id: string): Promise<Acai> {
    return this.acaiRepository.findOne({
      where: { id },
      relations: ['orderAdditionals'],
    });
  }

  async update(id: string, acaiDetails: Partial<UpdateAcaiDto>): Promise<Acai> {
    await this.acaiRepository.update(id, acaiDetails);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.acaiRepository.delete(id);
  }
}