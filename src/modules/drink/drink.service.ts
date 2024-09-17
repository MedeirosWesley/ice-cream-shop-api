import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { Drink } from './entities/drink.entity';

@Injectable()
export class DrinkService {
  constructor(
    @InjectRepository(Drink)
    private drinkRepository: Repository<Drink>,
  ) { }

  create(createDrinkDto: CreateDrinkDto): Promise<Drink> {
    const drink = this.drinkRepository.create(createDrinkDto);
    return this.drinkRepository.save(drink);
  }

  findAll(): Promise<Drink[]> {
    return this.drinkRepository.find();
  }

  findOne(id: number): Promise<Drink> {
    return this.drinkRepository.findOneBy({ id });
  }

  async update(id: number, updateDrinkDto: UpdateDrinkDto): Promise<Drink> {
    await this.drinkRepository.update(id, updateDrinkDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.drinkRepository.delete(id);
  }
}
