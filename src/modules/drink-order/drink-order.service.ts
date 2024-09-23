import { Injectable } from '@nestjs/common';
import { CreateDrinkOrderDto } from './dto/create-drink-order.dto';
import { UpdateDrinkOrderDto } from './dto/update-drink-order.dto';
import { DrinkOrder } from './entities/drink-order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DrinkOrderService {
  constructor(
    @InjectRepository(DrinkOrder)
    private readonly drinkOrderRepository: Repository<DrinkOrder>,
  ) { }

  create(createDrinkOrderDto: CreateDrinkOrderDto) {
    const { drinkId } = createDrinkOrderDto;
    const drinkOrder = this.drinkOrderRepository.create({
      drinkId,
    });
    return this.drinkOrderRepository.save(drinkOrder);
  }

  findAll() {
    return this.drinkOrderRepository.find({
      relations: ['drink'],
    });
  }

  findOne(id: string) {
    return this.drinkOrderRepository.findOne({
      where: { id },
      relations: ['drink'],
    });
  }

  update(id: string, updateDrinkOrderDto: UpdateDrinkOrderDto) {
    return this.drinkOrderRepository.update(id, updateDrinkOrderDto);
  }

  remove(id: string) {
    return this.drinkOrderRepository.delete(id);
  }
}
