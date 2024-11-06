import { Injectable } from '@nestjs/common';
import { CreateOtherProductDto } from './dto/create-other-product.dto';
import { UpdateOtherProductDto } from './dto/update-other-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OtherProduct } from './entities/other-product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OtherProductService {
  constructor(
    @InjectRepository(OtherProduct)
    private otherProductRepository: Repository<OtherProduct>,
  ) { }

  create(createOtherProductDto: CreateOtherProductDto): Promise<OtherProduct> {
    const otherProduct = this.otherProductRepository.create(createOtherProductDto);
    return this.otherProductRepository.save(otherProduct);
  }

  findAll(): Promise<OtherProduct[]> {
    return this.otherProductRepository.find();
  }

  findOne(id: string): Promise<OtherProduct> {
    return this.otherProductRepository.findOneBy({ id });
  }

  async update(id: string, updateOtherProductDto: UpdateOtherProductDto): Promise<OtherProduct> {
    await this.otherProductRepository.update(id, updateOtherProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.otherProductRepository.delete(id);
  }
}
