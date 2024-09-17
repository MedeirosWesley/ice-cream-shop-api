import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIceCreamFlavorDto } from './dto/create-ice-cream-flavor.dto';
import { UpdateIceCreamFlavorDto } from './dto/update-ice-cream-flavor.dto';
import { IceCreamFlavor } from './entities/ice-cream-flavor.entity';

@Injectable()
export class IceCreamFlavorService {
  constructor(
    @InjectRepository(IceCreamFlavor)
    private iceCreamFlavorRepository: Repository<IceCreamFlavor>,
  ) { }

  create(createIceCreamFlavorDto: CreateIceCreamFlavorDto): Promise<IceCreamFlavor> {
    const flavor = this.iceCreamFlavorRepository.create(createIceCreamFlavorDto);
    return this.iceCreamFlavorRepository.save(flavor);
  }

  findAll(): Promise<IceCreamFlavor[]> {
    return this.iceCreamFlavorRepository.find();
  }

  findOne(id: string): Promise<IceCreamFlavor> {
    return this.iceCreamFlavorRepository.findOneBy({ id });
  }

  async update(id: string, updateIceCreamFlavorDto: UpdateIceCreamFlavorDto): Promise<IceCreamFlavor> {
    await this.iceCreamFlavorRepository.update(id, updateIceCreamFlavorDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.iceCreamFlavorRepository.delete(id);
  }
}
