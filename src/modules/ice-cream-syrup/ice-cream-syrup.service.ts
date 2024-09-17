import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIceCreamSyrupDto } from './dto/create-ice-cream-syrup.dto';
import { UpdateIceCreamSyrupDto } from './dto/update-ice-cream-syrup.dto';
import { IceCreamSyrup } from './entities/ice-cream-syrup.entity';

@Injectable()
export class IceCreamSyrupService {
  constructor(
    @InjectRepository(IceCreamSyrup)
    private iceCreamSyrupRepository: Repository<IceCreamSyrup>,
  ) { }

  create(createIceCreamSyrupDto: CreateIceCreamSyrupDto): Promise<IceCreamSyrup> {
    const syrup = this.iceCreamSyrupRepository.create(createIceCreamSyrupDto);
    return this.iceCreamSyrupRepository.save(syrup);
  }

  findAll(): Promise<IceCreamSyrup[]> {
    return this.iceCreamSyrupRepository.find();
  }

  findOne(id: string): Promise<IceCreamSyrup> {
    return this.iceCreamSyrupRepository.findOneBy({ id });
  }

  async update(id: string, updateIceCreamSyrupDto: UpdateIceCreamSyrupDto): Promise<IceCreamSyrup> {
    await this.iceCreamSyrupRepository.update(id, updateIceCreamSyrupDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.iceCreamSyrupRepository.delete(id);
  }
}
