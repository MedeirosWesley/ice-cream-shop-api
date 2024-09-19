import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IceCreamSize } from './entities/ice-cream-size.entity';
import { CreateIceCreamSizeDto } from './dto/create-ice-cream-size.dto';
import { UpdateIceCreamSizeDto } from './dto/update-ice-cream-size.dto';


@Injectable()
export class IceCreamSizeService {
  constructor(
    @InjectRepository(IceCreamSize)
    private iceCreamSizeRepository: Repository<IceCreamSize>,
  ) { }

  create(createIceCreamSizeDto: CreateIceCreamSizeDto): Promise<IceCreamSize> {
    const iceCreamSize = this.iceCreamSizeRepository.create(createIceCreamSizeDto);
    return this.iceCreamSizeRepository.save(iceCreamSize);
  }

  findAll(): Promise<IceCreamSize[]> {
    return this.iceCreamSizeRepository.find();
  }

  findOne(id: string): Promise<IceCreamSize> {
    return this.iceCreamSizeRepository.findOneBy({ id });
  }

  async update(id: string, updateIceCreamSizeDto: UpdateIceCreamSizeDto): Promise<IceCreamSize> {
    await this.iceCreamSizeRepository.update(id, updateIceCreamSizeDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.iceCreamSizeRepository.delete(id);
  }
}
