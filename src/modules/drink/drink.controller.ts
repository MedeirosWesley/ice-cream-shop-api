import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DrinkService } from './drink.service';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { Drink } from './entities/drink.entity';

@Controller('drinks')
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) { }

  @Post()
  create(@Body() createDrinkDto: CreateDrinkDto): Promise<Drink> {
    return this.drinkService.create(createDrinkDto);
  }

  @Get()
  findAll(): Promise<Drink[]> {
    return this.drinkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Drink> {
    return this.drinkService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDrinkDto: UpdateDrinkDto,
  ): Promise<Drink> {
    return this.drinkService.update(id, updateDrinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.drinkService.remove(id);
  }
}
